import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Aptitude.css';

export default function AptitudePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionsError, setQuestionsError] = useState('');
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());

  // Fetch questions from API on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const response = await axios.get('http://localhost:5000/api/questions/aptitude/all');
        
        if (response.data.success && response.data.questions) {
          setQuestions(response.data.questions);
          // Set the first question as selected
          if (response.data.questions.length > 0) {
            setSelectedQuestion(response.data.questions[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setQuestionsError('Failed to load aptitude questions. Please try again.');
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, []);

  const currentQuestion = questions.find(q => q.id === selectedQuestion);
  const isCurrentAnswered = answeredQuestions.has(selectedQuestion);
  const canFinish = questions.length > 0 && answeredQuestions.size === questions.length;

  const handleSelectQuestion = (questionId) => {
    setSelectedQuestion(questionId);
    setSelectedAnswer(null);
    setFeedback(null);
  };

  const handleSelectAnswer = (optionIndex) => {
    // Only allow answer selection if not already answered
    if (!answeredQuestions.has(selectedQuestion)) {
      setSelectedAnswer(optionIndex);
      setFeedback(null);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) {
      alert('Please select an option');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/questions/aptitude/submit',
        {
          questionId: selectedQuestion,
          selectedAnswer: currentQuestion.options[selectedAnswer]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const result = response.data;
        setFeedback({
          isCorrect: result.isCorrect,
          correctAnswer: result.correctAnswer,
          explanation: result.explanation
        });

        if (result.isCorrect) {
          setScore(score + 1);
        }

        // Mark this question as answered
        setAnsweredQuestions(new Set([...answeredQuestions, selectedQuestion]));
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setFeedback({
        isCorrect: false,
        correctAnswer: currentQuestion?.correctAnswer,
        explanation: 'Error submitting answer. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishTest = () => {
    if (!canFinish) return;
    alert(`Test finished. Score: ${score}/${questions.length}`);
    navigate('/dashboard');
  };

  return (
    <div className="aptitude-page">
      <div className="aptitude-container">
        {/* Sidebar */}
        <div className="questions-sidebar">
          <h2>Aptitude Questions</h2>
          <div className="score-display">
            Score: <span className="score-value">{score}/{questions.length}</span>
          </div>
          {isLoadingQuestions ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              Loading questions...
            </div>
          ) : questionsError ? (
            <div style={{ padding: '20px', color: '#dc2626', fontSize: '14px' }}>
              {questionsError}
            </div>
          ) : (
            <div className="questions-list">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className={`question-item ${selectedQuestion === q.id ? 'active' : ''} ${answeredQuestions.has(q.id) ? 'answered' : ''}`}
                  onClick={() => handleSelectQuestion(q.id)}
                >
                  <div className="question-number">Q{questions.indexOf(q) + 1}</div>
                  <div className="question-info">
                    <div className="question-title">{q.title}</div>
                    <div className="question-meta">
                      <span className={`difficulty ${q.difficulty?.toLowerCase() || 'medium'}`}>
                        {q.difficulty}
                      </span>
                      {answeredQuestions.has(q.id) && <span className="answered-badge">Done</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="aptitude-main">
          {!isLoadingQuestions && questionsError ? (
            <div style={{ padding: '20px', color: '#dc2626', textAlign: 'center' }}>
              <h2>Error Loading Questions</h2>
              <p>{questionsError}</p>
              <p>Make sure the backend is running on port 5000</p>
            </div>
          ) : !isLoadingQuestions && currentQuestion ? (
            <>
              {/* Question Description */}
              <div className="question-section">
                <div className="question-header">
                  <h1>{currentQuestion.title}</h1>
                  <div className="question-badges">
                    <span className={`difficulty-badge ${currentQuestion.difficulty?.toLowerCase() || 'medium'}`}>
                      {currentQuestion.difficulty}
                    </span>
                    {currentQuestion.topic && (
                      <span className="topic-badge">{currentQuestion.topic}</span>
                    )}
                  </div>
                </div>
                <p className="description">{currentQuestion.description}</p>
              </div>

              {/* MCQ Options */}
              <div className="options-section">
                <h3>Select your answer:</h3>
                <div className="options-list">
                  {currentQuestion.options?.map((option, index) => (
                    <label
                      key={index}
                      className={`option-item ${selectedAnswer === index ? 'selected' : ''} ${
                        answeredQuestions.has(selectedQuestion) ? 'disabled' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${selectedQuestion}`}
                        value={index}
                        checked={selectedAnswer === index}
                        onChange={() => handleSelectAnswer(index)}
                        disabled={answeredQuestions.has(selectedQuestion)}
                      />
                      <span className="option-letter">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="option-text">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Feedback Section */}
              {feedback && (
                <div className={`feedback-section ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="feedback-header">
                    {feedback.isCorrect ? (
                      <>
                        <span className="feedback-title">Correct!</span>
                      </>
                    ) : (
                      <>
                        <span className="feedback-title">Incorrect</span>
                      </>
                    )}
                  </div>
                  {!feedback.isCorrect && (
                    <div className="correct-answer">
                      <strong>Correct Answer:</strong> {feedback.correctAnswer}
                    </div>
                  )}
                  <div className="explanation">
                    <strong>Explanation:</strong>
                    <p>{feedback.explanation}</p>
                  </div>
                </div>
              )}

              {/* Sticky Actions */}
              <div className="aptitude-actions" aria-label="Aptitude actions">
                {!isCurrentAnswered ? (
                  <button
                    className="submit-btn"
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                  </button>
                ) : (
                  <>
                    <button
                      className="nav-btn prev"
                      onClick={() => {
                        const currentIdx = questions.findIndex(q => q.id === selectedQuestion);
                        if (currentIdx > 0) {
                          handleSelectQuestion(questions[currentIdx - 1].id);
                        }
                      }}
                      disabled={questions.findIndex(q => q.id === selectedQuestion) === 0}
                    >
                      Previous
                    </button>
                    <button
                      className="nav-btn next"
                      onClick={() => {
                        const currentIdx = questions.findIndex(q => q.id === selectedQuestion);
                        if (currentIdx < questions.length - 1) {
                          handleSelectQuestion(questions[currentIdx + 1].id);
                        }
                      }}
                      disabled={questions.findIndex(q => q.id === selectedQuestion) === questions.length - 1}
                    >
                      Next
                    </button>
                  </>
                )}

                <button
                  className="finish-btn"
                  onClick={handleFinishTest}
                  disabled={!canFinish}
                  title={canFinish ? 'Finish the test' : 'Answer all questions to finish'}
                >
                  Finish Test
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
