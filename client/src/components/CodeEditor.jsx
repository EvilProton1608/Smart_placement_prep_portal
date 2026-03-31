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
  const [testResults, setTestResults] = useState([]);
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

  const handleRunCode = useCallback(async () => {
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
      });

      // If there's an error message (compilation error, runtime error)
      if (response.data.message) {
        setError(response.data.message);
        // Still show output if any
        if (response.data.output) {
          setOutput(response.data.output);
        }
      } else {
        // Success - show stdout
        setOutput(response.data.output || 'Code executed successfully (no output)');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error executing code';
      setError(errorMsg);
    } finally {
      setIsRunning(false);
    }
  }, [code, language]);

  const handleSubmitCode = useCallback(async () => {
    if (!code.trim()) {
      setError('Please write some code first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/coding/submit', {
        questionId,
        code,
        language,
      });

      setOutput('Code submitted successfully!');
      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting code');
    } finally {
      setIsLoading(false);
    }
  }, [code, language, questionId, onSubmit]);

  const handleClearCode = () => {
    if (window.confirm('Are you sure you want to clear the code?')) {
      setCode('');
      setOutput('');
      setError('');
      setTestResults([]);
    }
  };

  const handleRunTestCases = useCallback(async () => {
    if (!code.trim()) {
      setError('Please write some code first');
      return;
    }

    if (testCases.length === 0) {
      setError('No test cases available');
      return;
    }

    setIsRunning(true);
    setError('');
    setOutput(''); // Clear output section - results go to test results section
    const results = [];

    // Run each test case
    for (const testCase of testCases) {
      try {
        // Execute code with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Prepare code with test input injected
        let testCode = code;
        
        // Inject test input based on language
        if (language === 'javascript' || language === 'nodejs') {
          // JavaScript: inject the input as variable assignments
          testCode = testCase.input + ';\n' + code;
        } else if (language === 'python') {
          // Python: inject the input as variable assignments
          testCode = testCase.input + '\n' + code;
        } else if (language === 'cpp' || language === 'c') {
          // For C/C++, inject as comments (harder to auto-inject)
          testCode = '/* Input: ' + testCase.input + ' */\n' + code;
        } else if (language === 'java') {
          // For Java, inject as comments
          testCode = '// Input: ' + testCase.input + '\n' + code;
        }

        const response = await axios.post(
          'http://localhost:5000/api/coding/execute',
          {
            code: testCode,
            language,
          },
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        const output = response.data.output || '';
        const message = response.data.message || '';
        const status_desc = response.data.status || '';

        // Build comprehensive error message with all error details
        let fullErrorMessage = '';
        if (message) {
          fullErrorMessage = message;
        }
        if (status_desc && status_desc.includes('Error')) {
          fullErrorMessage = fullErrorMessage ? fullErrorMessage + '\n' + status_desc : status_desc;
        }

        // Determine test status
        let status = 'pass';
        if (message || (status_desc && (status_desc.includes('Error') || status_desc.includes('error')))) {
          status = 'error';
        } else {
          // Smart comparison: normalize whitespace and try JSON parsing
          const normalizeOutput = (str) => {
            // Remove extra whitespace
            let normalized = str.trim().replace(/\s+/g, '');
            // If it's JSON-like, parse and stringify to normalize
            try {
              normalized = JSON.stringify(JSON.parse(str.trim()));
            } catch (e) {
              // Not JSON, use normalized string
            }
            return normalized;
          };

          const normalizedOutput = normalizeOutput(output);
          const normalizedExpected = normalizeOutput(testCase.expected);

          if (normalizedOutput !== normalizedExpected) {
            status = 'fail';
          }
        }

        results.push({
          testId: testCase.id,
          description: testCase.description,
          expected: testCase.expected,
          input: testCase.input,
          output: output,
          status: status,
          message: fullErrorMessage
        });

        // Small delay between test executions
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        let status = 'error';
        let message = err.message || 'Execution error';

        // Check if it's a timeout
        if (err.code === 'ECONNABORTED' || message.includes('timeout')) {
          status = 'timeout';
          message = 'Test execution timeout (5s limit)';
        }

        results.push({
          testId: testCase.id,
          description: testCase.description,
          expected: testCase.expected,
          input: testCase.input,
          output: '',
          status: status,
          message: message
        });
      }
    }

    setTestResults(results);
    if (onTestResults) {
      onTestResults(results);
    }
    setIsRunning(false);
  }, [code, language, testCases]);

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
            {isRunning ? 'Running...' : '▶ Run'}
          </button>
          <button
            onClick={handleRunTestCases}
            disabled={isRunning || isLoading || testCases.length === 0}
            className="btn btn-info"
            title="Run all test cases"
          >
            {isRunning ? 'Testing...' : '🧪 Test Cases'}
          </button>
          <button
            onClick={handleSubmitCode}
            disabled={isLoading || isRunning}
            className="btn btn-success"
            title="Submit solution"
          >
            {isLoading ? 'Submitting...' : '✓ Submit'}
          </button>
          <button
            onClick={handleClearCode}
            disabled={isLoading || isRunning}
            className="btn btn-danger"
            title="Clear code"
          >
            ✕ Clear
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
              {error ? '❌ Error' : '✓ Success'}
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
