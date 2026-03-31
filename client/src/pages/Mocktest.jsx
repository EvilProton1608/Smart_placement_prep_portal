import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Mocktest.css';

export default function Mocktest() {
  const navigate = useNavigate();
  const [view, setView] = useState('list'); // list, test, results
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Test state
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [results, setResults] = useState(null);

  // Fetch available tests
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/test/available', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setTests(response.data || mockTests);
      } catch (err) {
        console.error('Error fetching tests:', err);
        setTests(mockTests);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!testStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, timeLeft]);

  const startTest = useCallback((test) => {
    setSelectedTest(test);
    setQuestions(test.questions || mockQuestions);
    setTimeLeft(test.duration * 60);
    setCurrentQuestion(0);
    setAnswers({});
    setTestStarted(true);
    setView('test');
  }, []);

  const handleAnswerSelect = useCallback((questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    try {
      // Calculate score
      let score = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) {
          score++;
        }
      });

      const accuracy = ((score / questions.length) * 100).toFixed(2);
      const submitted = new Date().toLocaleString();

      const testResults = {
        testName: selectedTest.name,
        totalQuestions: questions.length,
        correct: score,
        accuracy,
        submitted,
        timeSpent: (selectedTest.duration * 60) - timeLeft
      };

      setResults(testResults);

      // Save results to backend
      try {
        await axios.post('http://localhost:5000/api/test/submit', {
          testId: selectedTest.id,
          score,
          totalQuestions: questions.length,
          accuracy,
          answers
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (err) {
        console.log('Could not save to backend, showing local results');
      }

      setView('results');
      setTestStarted(false);
    } catch (err) {
      console.error('Error submitting test:', err);
      setError('Failed to submit test. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTestList = () => (
    <div className="mocktest-container">
      <div className="mocktest-header">
        <h1>📝 Mock Tests</h1>
        <p>Practice with full-length placement tests</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading tests...</p>
        </div>
      ) : (
        <div className="tests-grid">
          {tests.map((test, index) => (
            <div key={index} className="test-card">
              <div className="test-card-header">
                <h3>{test.name}</h3>
                <span className={`difficulty-badge difficulty-${test.difficulty}`}>
                  {test.difficulty}
                </span>
              </div>
              <div className="test-details">
                <p><strong>Questions:</strong> {test.questions?.length || 100}</p>
                <p><strong>Duration:</strong> {test.duration} mins</p>
                <p><strong>Difficulty:</strong> {test.difficulty}</p>
                {test.description && <p className="test-description">{test.description}</p>}
              </div>
              <button
                className="btn btn-primary"
                onClick={() => startTest(test)}
              >
                Start Test
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTestInterface = () => {
    if (!selectedTest || questions.length === 0) return null;

    const current = questions[currentQuestion];
    const answered = Object.keys(answers).length;

    return (
      <div className="mocktest-interface">
        <div className="test-header">
          <div className="test-info">
            <h2>{selectedTest.name}</h2>
            <span className="progress">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="test-timer">
            <span className={timeLeft < 300 ? 'time-warning' : ''}>
              ⏱️ {formatTime(timeLeft)}
            </span>
            <span className="answered-count">
              {answered}/{questions.length} answered
            </span>
          </div>
        </div>

        <div className="test-content">
          <div className="question-panel">
            <div className="question-container">
              <h3 className="question-text">
                Q{currentQuestion + 1}: {current.question}
              </h3>

              <div className="options">
                {current.options.map((option, idx) => (
                  <label key={idx} className="option">
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={answers[current.id] === option}
                      onChange={() => handleAnswerSelect(current.id, option)}
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="question-navigation">
              <button
                className="btn btn-secondary"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                ← Previous
              </button>

              <button
                className="btn btn-primary"
                onClick={handleNextQuestion}
                disabled={currentQuestion === questions.length - 1}
              >
                Next →
              </button>
            </div>
          </div>

          <div className="questions-sidebar">
            <h4>Questions Overview</h4>
            <div className="questions-grid">
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  className={`question-btn ${
                    idx === currentQuestion ? 'active' : ''
                  } ${answers[q.id] ? 'answered' : 'unanswered'}`}
                  onClick={() => setCurrentQuestion(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              className="btn btn-danger btn-submit"
              onClick={handleSubmitTest}
            >
              🏁 Submit Test
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => (
    <div className="results-container">
      <div className="results-header">
        <h1>✅ Test Completed!</h1>
      </div>

      <div className="results-card">
        <div className="result-stat">
          <div className="stat-value" style={{ color: '#667eea' }}>
            {results.accuracy}%
          </div>
          <div className="stat-label">Accuracy</div>
        </div>

        <div className="result-stat">
          <div className="stat-value" style={{ color: '#27ae60' }}>
            {results.correct}/{results.totalQuestions}
          </div>
          <div className="stat-label">Correct Answers</div>
        </div>

        <div className="result-stat">
          <div className="stat-value" style={{ color: '#e74c3c' }}>
            {results.totalQuestions - results.correct}
          </div>
          <div className="stat-label">Incorrect Answers</div>
        </div>
      </div>

      <div className="results-details">
        <h3>Test Details</h3>
        <div className="detail-row">
          <span>Test Name:</span>
          <strong>{results.testName}</strong>
        </div>
        <div className="detail-row">
          <span>Total Questions:</span>
          <strong>{results.totalQuestions}</strong>
        </div>
        <div className="detail-row">
          <span>Time Spent:</span>
          <strong>{formatTime(results.timeSpent)}</strong>
        </div>
        <div className="detail-row">
          <span>Submitted At:</span>
          <strong>{results.submitted}</strong>
        </div>
      </div>

      <div className="results-actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            setView('list');
            setSelectedTest(null);
            setResults(null);
          }}
        >
          Take Another Test
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="mocktest-page">
      {view === 'list' && renderTestList()}
      {view === 'test' && renderTestInterface()}
      {view === 'results' && renderResults()}
    </div>
  );
}

// Mock data (remove when backend is ready)
const mockTests = [
  {
    id: 1,
    name: 'Placement Test - Set 1',
    difficulty: 'Medium',
    duration: 120,
    description: 'Full-length placement test covering coding, aptitude, and logical reasoning',
    questions: generateMockQuestions(100)
  },
  {
    id: 2,
    name: 'Placement Test - Set 2',
    difficulty: 'Hard',
    duration: 120,
    description: 'Advanced placement test with tricky questions',
    questions: generateMockQuestions(100)
  },
  {
    id: 3,
    name: 'Quick Assessment',
    difficulty: 'Easy',
    duration: 30,
    description: 'Quick 30-minute assessment test',
    questions: generateMockQuestions(30)
  }
];

const mockQuestions = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  question: `Sample Question ${i + 1}: What is the output of the following code?`,
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correctAnswer: 'Option A'
}));

function generateMockQuestions(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    question: `Sample Question ${i + 1}: Which of the following is correct?`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option A'
  }));
}
