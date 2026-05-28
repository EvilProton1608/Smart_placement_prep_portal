import axios from 'axios';
import { useEffect, useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import '../styles/Coding.css';

export default function CodingPage() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState('');

  // Fetch questions from API on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const response = await axios.get('http://localhost:5000/api/questions');
        
        if (response.data.success && response.data.questions) {
          setQuestions(response.data.questions);
          // Set the first question as selected
          if (response.data.questions.length > 0) {
            setSelectedQuestion(response.data.questions[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setQuestionsError('Failed to load questions. Please try again.');
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, []);

  const currentQuestion = questions.find(q => q.id === selectedQuestion);

  const handleSubmit = (submission) => {
    setSubmissions([...submissions, {
      ...submission,
      questionId: selectedQuestion,
      timestamp: new Date().toLocaleString()
    }]);
  };

  const handleTestResults = (results) => {
    setTestResults(results);
  };

  return (
    <div className="coding-page">
      <div className="coding-container">
        {/* Sidebar */}
        <div className="problems-sidebar">
          <h2>Coding Problems</h2>
          {isLoadingQuestions ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              Loading problems...
            </div>
          ) : questionsError ? (
            <div style={{ padding: '20px', color: '#dc2626', fontSize: '14px' }}>
              {questionsError}
            </div>
          ) : (
            <div className="problems-list">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className={`problem-item ${selectedQuestion === q.id ? 'active' : ''}`}
                  onClick={() => setSelectedQuestion(q.id)}
                >
                  <div className="problem-title">{q.title}</div>
                  <div className={`difficulty ${q.difficulty.toLowerCase()}`}>
                    {q.difficulty}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="coding-main">
          {!isLoadingQuestions && questionsError ? (
            <div style={{ padding: '20px', color: '#dc2626', textAlign: 'center' }}>
              <h2>Error Loading Questions</h2>
              <p>{questionsError}</p>
              <p>Make sure the backend is running on port 5000</p>
            </div>
          ) : !isLoadingQuestions && currentQuestion ? (
            <>
              {/* Problem Description */}
              <div className="problem-section">
                <h1>{currentQuestion.title}</h1>
                <p className="description">{currentQuestion.description}</p>
                <div className="example">
                  <strong>Example:</strong>
                  <pre>{currentQuestion.example}</pre>
                </div>
              </div>

              {/* Code Editor */}
              <div className="editor-section">
                <CodeEditor 
                  questionId={selectedQuestion} 
                  onSubmit={handleSubmit}
                  testCases={currentQuestion.testCases}
                  onTestResults={handleTestResults}
                />
              </div>

              {/* Test Results Section */}
              {testResults.length > 0 && (
                <div className="results-section">
                  <div className="results-header">
                    <h3>Test Results</h3>
                    <div className="results-summary">
                      <span className={`result-badge pass`}>
                        {testResults.filter(r => r.status === 'pass').length} Passed
                      </span>
                      <span className={`result-badge fail`}>
                        {testResults.filter(r => r.status === 'fail').length} Failed
                      </span>
                      <span className={`result-badge error`}>
                        {testResults.filter(r => r.status === 'error').length} Error
                      </span>
                      <span className={`result-badge timeout`}>
                        {testResults.filter(r => r.status === 'timeout').length} Timeout
                      </span>
                    </div>
                  </div>
                  <div className="results-list">
                    {testResults.map((result, idx) => (
                      <div key={idx} className={`result-item ${result.status}`}>
                        <div className="result-status">
                      <span className="status-label">{result.status.toUpperCase()}</span>
                    </div>
                    <div className="result-case">
                      <strong>Test Case {result.testId}</strong>
                      <p>{result.description}</p>
                    </div>
                    <div className="result-details">
                      <div className="detail-row">
                        <span className="label">Input:</span>
                        <span className="value">{result.input}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Expected:</span>
                        <span className="value">{result.expected}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Got Result:</span>
                        <span className="value">{result.output}</span>
                      </div>
                      {result.message && (
                        <div className="detail-row">
                          <span className="label">Message:</span>
                          <span className="value error-msg">{result.message}</span>
                        </div>
                      )}
                      {result.status === 'fail' && !result.message && (
                        <div className="detail-row">
                          <span className="label">Message:</span>
                          <span className="value error-msg">Output does not match expected result</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
              )}
            </>
          ) : isLoadingQuestions ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <h2>Loading...</h2>
              <p>Fetching problems from database</p>
            </div>
          ) : null}
        </div>

        {/* Submissions History */}
        {submissions.length > 0 && (
          <div className="submissions-sidebar">
            <h3>Recent Submissions</h3>
            <div className="submissions-list">
              {submissions.map((sub, idx) => (
                <div key={idx} className="submission-item">
                  <div className="submission-header">
                    <span className="question-name">Q{sub.questionId}</span>
                    <span className="language-badge">{sub.language}</span>
                  </div>
                  <div className="submission-time">{sub.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
