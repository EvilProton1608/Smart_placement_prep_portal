import axios from 'axios';
import { useCallback, useRef, useState } from 'react';
import '../styles/CodeEditor.css';

const CodeEditor = ({ questionId, onSubmit, testCases = [], onTestResults }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('light');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [, setTestResults] = useState([]);
  const editorRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
  ];

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const runCodeAgainstTestCases = useCallback(async () => {
    if (!code.trim()) {
      setError('Please write some code first');
      return;
    }

    setIsRunning(true);
    setError('');
    setOutput('');

    try {
      const response = await axios.post('http://localhost:5000/api/coding/execute', {
        code,
        language,
        testCases,
      });

      if (response.data.evaluation?.results) {
        const results = response.data.evaluation.results;
        const passed = results.filter((result) => result.status === 'pass').length;
        const total = results.length;

        setTestResults(results);
        setOutput(`${passed}/${total} test cases passed`);

        if (onTestResults) {
          onTestResults(results);
        }

        if (passed !== total) {
          setError('Some test cases failed. Check the test results below.');
        }
      } else if (response.data.message) {
        setError(response.data.message);
        setOutput(response.data.output || '');
      } else {
        setOutput(response.data.output || 'Code executed successfully (no output)');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error executing code';
      setError(errorMsg);
    } finally {
      setIsRunning(false);
    }
  }, [code, language, onTestResults, testCases]);

  const handleRunCode = useCallback(async () => {
    await runCodeAgainstTestCases();
  }, [runCodeAgainstTestCases]);

  const handleSubmitCode = useCallback(async () => {
    if (!code.trim()) {
      setError('Please write some code first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/coding/submit',
        {
          questionId,
          code,
          language,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.evaluation?.results) {
        const results = response.data.evaluation.results;
        const passed = results.filter((result) => result.status === 'pass').length;
        const total = results.length;

        setTestResults(results);
        setOutput(`Submitted: ${passed}/${total} test cases passed`);

        if (onTestResults) {
          onTestResults(results);
        }
      } else {
        setOutput('Code submitted successfully!');
      }

      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting code');
    } finally {
      setIsLoading(false);
    }
  }, [code, language, questionId, onSubmit, onTestResults]);

  const handleClearCode = () => {
    if (window.confirm('Are you sure you want to clear the code?')) {
      setCode('');
      setOutput('');
      setError('');
      setTestResults([]);
    }
  };

  const handleRunTestCases = useCallback(async () => {
    if (testCases.length === 0) {
      setError('No test cases available');
      return;
    }

    await runCodeAgainstTestCases();
  }, [runCodeAgainstTestCases, testCases.length]);

  return (
    <div className={`code-editor-container ${theme}`}>
      {/* Header Controls */}
      <div className="editor-header">
        <div className="controls-left">
          <div className="control-group">
            <label htmlFor="language-select">Language:</label>
            <select
              id="language-select"
              value={language}
              onChange={handleLanguageChange}
              className="select-input"
              disabled={isLoading || isRunning}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="theme-select">Theme:</label>
            <select
              id="theme-select"
              value={theme}
              onChange={handleThemeChange}
              className="select-input"
            >
              {themes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="controls-right">
          <button
            onClick={handleRunCode}
            disabled={isRunning || isLoading}
            className="btn btn-primary"
            title="Run code and see output"
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={handleRunTestCases}
            disabled={isRunning || isLoading || testCases.length === 0}
            className="btn btn-info"
            title="Run all test cases"
          >
            {isRunning ? 'Testing...' : 'Test Cases'}
          </button>
          <button
            onClick={handleSubmitCode}
            disabled={isLoading || isRunning}
            className="btn btn-success"
            title="Submit solution"
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
          <button
            onClick={handleClearCode}
            disabled={isLoading || isRunning}
            className="btn btn-danger"
            title="Clear code"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="editor-wrapper">
        <div className="line-numbers">
          {code.split('\n').map((_, index) => (
            <div key={index + 1} className="line-number">
              {index + 1}
            </div>
          ))}
        </div>
        <textarea
          ref={editorRef}
          value={code}
          onChange={handleCodeChange}
          className="code-textarea"
          placeholder={`Write your ${language} code here...`}
          spellCheck="false"
          disabled={isLoading || isRunning}
        />
      </div>

      {/* Output Section */}
      <div className="output-section">
        <div className="output-header">
          <h3>Output</h3>
          {(output || error) && (
            <span className="output-status">
              {error ? 'Error' : 'Success'}
            </span>
          )}
        </div>
        <div className={`output-box ${error ? 'error' : ''}`}>
          {output || error || 'Output will appear here...'}
        </div>
      </div>

      {/* Stats Section */}
      <div className="editor-footer">
        <div className="char-count">
          Characters: {code.length} | Lines: {code.split('\n').length}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
