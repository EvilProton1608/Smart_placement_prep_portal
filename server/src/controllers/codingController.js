const axios = require("axios");
const prisma = require("../config/db");
const { computeAndUpsertUserProgress } = require("../services/userProgressService");

// Judge0 API Configuration - Free API (no subscription needed)
const JUDGE0_API = "https://ce.judge0.com";

// Language ID mapping for Judge0
const LANGUAGE_MAP = {
  "javascript": 63,  // Node.js
  "python": 71,      // Python 3
  "cpp": 54,         // C++
  "c": 50,           // C
  "java": 62         // Java
};

// Submit code to Judge0
const submitToJudge0 = async (code, languageId, stdin = "") => {
  try {
    const response = await axios.post(
      `${JUDGE0_API}/submissions?base64_encoded=false`,
      {
        source_code: code,
        language_id: languageId,
        stdin: stdin || ""
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 5000
      }
    );
    return response.data.token;
  } catch (err) {
    throw new Error(`Failed to submit code to Judge0: ${err.message}`);
  }
};

// Poll result from Judge0
const getJudge0Result = async (token) => {
  try {
    let result;
    let attempts = 0;
    const maxAttempts = 20; // 20 * 500ms = 10 seconds max wait

    while (attempts < maxAttempts) {
      const response = await axios.get(
        `${JUDGE0_API}/submissions/${token}?base64_encoded=false`,
        {
          timeout: 5000
        }
      );

      result = response.data;
      
      // Status codes: 1=In Queue, 2=Processing, 3=Accepted
      if (result.status.id >= 3) {
        break;
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
    }

    const output = result.stdout || "";
    const stderr = result.stderr || result.compile_output || "";
    const statusDescription = result.status.description;

    // Check if compilation error
    if (result.status.id === 4 || result.compile_output) {
      return {
        success: false,
        output: output,
        stderr: result.compile_output || stderr,
        status: statusDescription
      };
    }

    // Check if runtime error
    if (result.status.id === 5 || result.status.id === 6) {
      return {
        success: false,
        output: output,
        stderr: result.stderr || statusDescription,
        status: statusDescription
      };
    }

    return {
      success: result.status.id === 3,
      output: output || "Code executed successfully (no output)",
      stderr: stderr,
      status: statusDescription
    };
  } catch (err) {
    throw new Error(`Failed to get Judge0 result: ${err.message}`);
  }
};

const normalizeOutput = (text) =>
  String(text ?? "")
    .replace(/\r\n/g, "\n")
    .trim();

const formatTestCase = (testCase, index) => ({
  testId: index + 1,
  dbTestCaseId: testCase.id,
  description: testCase.description || `Test case ${index + 1}`,
  input: testCase.input || "",
  expected: testCase.expectedOutput ?? testCase.expected ?? "",
});

const evaluateAgainstTestCases = async ({ code, language, testCases }) => {
  if (!Array.isArray(testCases) || testCases.length === 0) {
    return { status: "submitted", results: [] };
  }

  if (!LANGUAGE_MAP[language]) {
    return { status: "failed", results: [{ status: "error", message: "Unsupported language" }] };
  }

  const results = [];
  for (let index = 0; index < testCases.length; index++) {
    const tc = formatTestCase(testCases[index], index);

    try {
      const token = await submitToJudge0(code, LANGUAGE_MAP[language], tc.input);
      const run = await getJudge0Result(token);

      if (!run.success) {
        results.push({
          ...tc,
          status: "error",
          message: run.stderr || run.status || "Execution error",
          output: run.output || "",
        });
        continue;
      }

      const got = normalizeOutput(run.output);
      const expected = normalizeOutput(tc.expected);

      if (got !== expected) {
        results.push({
          ...tc,
          status: "fail",
          output: run.output || "",
          message: "Output does not match expected result",
        });
        continue;
      }

      results.push({
        ...tc,
        status: "pass",
        output: run.output || "",
        message: "",
      });
    } catch (err) {
      results.push({
        ...tc,
        status: "error",
        output: "",
        message: err.message || "Execution error",
      });
    }
  }

  const status = results.every((result) => result.status === "pass")
    ? "passed"
    : "failed";

  return { status, results };
};

// Execute code using Judge0 API
exports.executeCode = async (req, res) => {
  try {
    const { code, language, stdin = "", testCases = [] } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        message: "Code and language are required"
      });
    }

    // Validate language
    if (!LANGUAGE_MAP[language]) {
      return res.status(400).json({
        message: `Language '${language}' is not supported`
      });
    }

    try {
      if (Array.isArray(testCases) && testCases.length > 0) {
        const evaluation = await evaluateAgainstTestCases({
          code,
          language,
          testCases,
        });

        const passed = evaluation.results.filter((result) => result.status === "pass").length;
        const total = evaluation.results.length;

        return res.json({
          success: evaluation.status === "passed",
          output: `${passed}/${total} test cases passed`,
          message: evaluation.status === "passed" ? "" : "Some test cases failed",
          status: evaluation.status,
          evaluation,
        });
      }

      // Submit code to Judge0
      const token = await submitToJudge0(code, LANGUAGE_MAP[language], stdin);
      
      // Poll for result
      const result = await getJudge0Result(token);

      // Return results with separate stdout and stderr
      return res.json({
        output: result.output || "",
        message: result.stderr || "",
        success: result.success,
        status: result.status
      });
    } catch (err) {
      console.error("Code execution error:", err.message);
      
      return res.status(500).json({
        output: "",
        message: `Execution error: ${err.message}`,
        success: false
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Error executing code",
      error: err.message
    });
  }
};

// Submit code solution
exports.submitCode = async (req, res) => {
  try {
    const { questionId, code, language } = req.body;

    if (!questionId || !code || !language) {
      return res.status(400).json({
        message: "questionId, code, and language are required"
      });
    }

    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
      include: { testCases: true }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    const evaluation = await evaluateAgainstTestCases({
      code,
      language,
      testCases: question.testCases
    });

    const submission = await prisma.codingSubmission.create({
      data: {
        userId: req.user.id,
        questionId: parseInt(questionId),
        code,
        language,
        status: evaluation.status
      }
    });

    await computeAndUpsertUserProgress(req.user.id);

    res.json({
      success: true,
      message: "Code submitted successfully",
      submission,
      evaluation: {
        status: evaluation.status,
        results: evaluation.results
      }
    });
  } catch (err) {
    res.status(500).json({
      message: "Error submitting code",
      error: err.message
    });
  }
};
