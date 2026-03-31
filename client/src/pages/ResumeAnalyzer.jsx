
import { useMemo, useState } from 'react';
import API from '../services/api';
import '../styles/ResumeAnalyzer.css';

export default function ResumeAnalyzer() {
	const [selectedFile, setSelectedFile] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState('');
	const [result, setResult] = useState(null);

	const feedbackItems = useMemo(() => {
		const feedback = result?.feedback || '';
		return feedback
			.split(/\r?\n|;/g)
			.map((item) => item.replace(/^•\s*/g, '').trim())
			.filter(Boolean);
	}, [result]);

	const handleFileChange = (e) => {
		const file = e.target.files?.[0] || null;
		setSelectedFile(file);
		setError('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!selectedFile) {
			setError('Please select a resume file to upload.');
			return;
		}

		try {
			setUploading(true);
			setError('');
			setResult(null);

			const formData = new FormData();
			formData.append('resume', selectedFile);

			const response = await API.post('/resume', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			setResult(response.data);
		} catch (err) {
			console.error('Resume upload failed:', err);
			setError(err.response?.data?.message || 'Upload failed. Please try again.');
		} finally {
			setUploading(false);
		}
	};

	const handleReset = () => {
		setSelectedFile(null);
		setResult(null);
		setError('');
	};

	const atsScore = typeof result?.atsScore === 'number' ? result.atsScore : null;
	const scorePercent = atsScore === null ? 0 : Math.max(0, Math.min(100, atsScore));
	const resumeLink = result?.fileUrl ? `http://localhost:5000${result.fileUrl}` : '';

	return (
		<div className="resume-page">
			<div className="resume-container">
				<div className="resume-header">
					<h1 className="resume-title">📄 Resume Analyzer</h1>
					<p className="resume-subtitle">
						Upload your resume to get an ATS score and improvement suggestions.
					</p>
				</div>

				<div className="resume-card">
					<form className="resume-form" onSubmit={handleSubmit}>
						<div className="form-row">
							<label className="form-label" htmlFor="resumeFile">
								Resume File
							</label>
							<input
								id="resumeFile"
								className="file-input"
								type="file"
								accept=".pdf,.doc,.docx"
								onChange={handleFileChange}
							/>
							<div className="form-hint">
								Supported: PDF, DOC, DOCX
							</div>
						</div>

						{error && <div className="resume-alert resume-alert-error">{error}</div>}

						<div className="resume-actions">
							<button type="submit" className="resume-btn primary" disabled={uploading}>
								{uploading ? '⏳ Analyzing…' : 'Upload & Analyze'}
							</button>
							<button type="button" className="resume-btn secondary" onClick={handleReset} disabled={uploading}>
								Reset
							</button>
						</div>
					</form>
				</div>

				{result && (
					<div className="resume-results">
						<div className="resume-card">
							<div className="results-header">
								<h2 className="results-title">Analysis Result</h2>
								{resumeLink && (
									<a className="results-link" href={resumeLink} target="_blank" rel="noreferrer">
										View uploaded resume
									</a>
								)}
							</div>

							<div className="score-row">
								<div className="score-box">
									<div className="score-label">ATS Score</div>
									<div className="score-value">{atsScore === null ? '—' : `${atsScore}/100`}</div>
								</div>

								<div className="score-bar" aria-label="ATS score bar">
									<div className="score-bar-fill" style={{ width: `${scorePercent}%` }} />
								</div>
							</div>

							<div className="feedback">
								<div className="feedback-title">Suggestions</div>
								{feedbackItems.length === 0 ? (
									<div className="feedback-empty">No suggestions available yet.</div>
								) : (
									<ul className="feedback-list">
										{feedbackItems.map((item, idx) => (
											<li key={idx}>{item}</li>
										))}
									</ul>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

