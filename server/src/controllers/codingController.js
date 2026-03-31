const axios = require("axios");
const prisma = require("../config/db");

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

// Execute code using Judge0 API
exports.executeCode = async (req, res) => {
  try {
    const { code, language, stdin = "" } = req.body;

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

    const submission = await prisma.codingSubmission.create({
      data: {
        userId: req.user.id,
        questionId,
        code,
        language,
        status: "submitted"
      }
    });

    res.json({
      success: true,
      message: "Code submitted successfully",
      submission
    });
  } catch (err) {
    res.status(500).json({
      message: "Error submitting code",
      error: err.message
    });
  }
};
