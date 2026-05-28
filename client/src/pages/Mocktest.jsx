import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import "../styles/Mocktest.css";

export default function Mocktest() {
  const [view, setView] = useState("list");
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [results, setResults] = useState(null);

  const API = "http://localhost:5000/api/tests";

  // Fetch available tests
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${API}/available`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setTests(response.data);
      } catch (err) {
        console.error("Error fetching tests:", err);
        setError("Failed to load tests");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Timer
  useEffect(() => {
    if (!testStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, timeLeft]);

  // Start Test
  const startTest = useCallback(async (test) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/${test.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Format backend response
      const formattedQuestions = response.data.map((q) => ({
        id: q.id,
        question: q.title,
        options: q.options,
        correctAnswer: q.correctAnswer,
      }));

      setSelectedTest(test);
      setQuestions(formattedQuestions);
      setTimeLeft(test.duration * 60);
      setCurrentQuestion(0);
      setAnswers({});
      setTestStarted(true);
      setView("test");
    } catch (err) {
      console.error("Error loading test:", err);
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnswerSelect = useCallback((questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    try {
      let score = 0;

      questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) {
          score++;
        }
      });

      const accuracy = questions.length
        ? ((score / questions.length) * 100).toFixed(2)
        : "0.00";

      const submitted = new Date().toLocaleString();

      const testResults = {
        testName: selectedTest.title,
        totalQuestions: questions.length,
        correct: score,
        accuracy,
        submitted,
        timeSpent:
          selectedTest.duration * 60 - timeLeft,
      };

      setResults(testResults);

      // Save result
      try {
        await axios.post(
          `${API}/submit`,
          {
            testId: selectedTest.id,
            score,
            totalQuestions: questions.length,
            accuracy,
            answers,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "token"
              )}`,
            },
          }
        );
      } catch (err) {
        console.log("Result saved locally");
      }

      setView("results");
      setTestStarted(false);
    } catch (err) {
      console.error(err);
      setError("Failed to submit test");
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h
      .toString()
      .padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  // TEST LIST
  const renderTestList = () => (
    <div className="mocktest-container">
      <div className="mocktest-header">
        <h1>Mock Tests</h1>
        <p>Practice placement tests</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading tests...</p>
        </div>
      ) : (
        <div className="tests-grid">
          {tests.map((test) => (
            <div
              key={test.id}
              className="test-card"
            >
              <div className="test-card-header">
                <h3>{test.title}</h3>

                <span className="difficulty-badge">
                  {test.difficulty ||
                    "Medium"}
                </span>
              </div>

              <div className="test-details">
                <p>
                  <strong>Duration:</strong>{" "}
                  {test.duration} mins
                </p>
              </div>

              <button
                className="btn btn-primary"
                onClick={() =>
                  startTest(test)
                }
              >
                Start Test
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // TEST INTERFACE
  const renderTestInterface = () => {
    if (
      !selectedTest ||
      questions.length === 0
    )
      return null;

    const current =
      questions[currentQuestion];

    const answered =
      Object.keys(answers).length;

    return (
      <div className="mocktest-interface">
        <div className="test-header">
          <div className="test-info">
            <h2>
              {selectedTest.title}
            </h2>

            <span className="progress">
              Question{" "}
              {currentQuestion + 1} of{" "}
              {questions.length}
            </span>
          </div>

          <div className="test-timer">
            <span>
              {formatTime(timeLeft)}
            </span>

            <span>
              {answered}/
              {questions.length} answered
            </span>
          </div>
        </div>

        <div className="test-content">
          <div className="question-panel">
            <h3 className="question-text">
              Q{currentQuestion + 1}:{" "}
              {current.question}
            </h3>

            <div className="options">
              {current.options.map(
                (option, idx) => (
                  <label
                    key={idx}
                    className="option"
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={
                        answers[current.id] ===
                        option
                      }
                      onChange={() =>
                        handleAnswerSelect(
                          current.id,
                          option
                        )
                      }
                    />

                    <span className="option-text">
                      {option}
                    </span>
                  </label>
                )
              )}
            </div>

            <div className="question-navigation">
              <button
                className="btn btn-secondary"
                onClick={
                  handlePreviousQuestion
                }
                disabled={
                  currentQuestion === 0
                }
              >
                Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  className="btn btn-submit-test"
                  onClick={handleSubmitTest}
                >
                  Submit Test
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={
                    handleNextQuestion
                  }
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  // RESULTS
  const renderResults = () => (
    <div className="results-container">
      <div className="results-header">
        <h1>Test Completed</h1>
      </div>

      <div className="results-card">
        <div className="result-stat">
          <div className="stat-value">
            {results.correct}/{results.totalQuestions}
          </div>
          <div className="stat-label">Score</div>
        </div>

        <div className="result-stat">
          <div className="stat-value">
            {results.accuracy}%
          </div>
          <div className="stat-label">Accuracy</div>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={() => {
          setView("list");
          setResults(null);
        }}
      >
        Take Another Test
      </button>
    </div>
  );

  return (
    <div className="mocktest-page">
      {view === "list" &&
        renderTestList()}

      {view === "test" &&
        renderTestInterface()}

      {view === "results" &&
        renderResults()}
    </div>
  );
}
