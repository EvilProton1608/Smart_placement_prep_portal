import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: '💻',
      title: 'Coding Practice',
      description: 'Master DSA and coding problems with our extensive database. Practice problems from top companies including LeetCode problems.',
      gradient: 'gradient-1'
    },
    {
      icon: '📊',
      title: 'Aptitude Tests',
      description: 'Comprehensive aptitude tests covering quantitative, logical reasoning, and verbal ability sections.',
      gradient: 'gradient-2'
    },
    {
      icon: '🎯',
      title: 'Mock Tests',
      description: 'Real-time mock tests that simulate actual placement exams. Get instant feedback and detailed analytics.',
      gradient: 'gradient-3'
    },
    {
      icon: '❓',
      title: 'Quiz Mode',
      description: 'Quick quizzes to test your knowledge on various topics. Perfect for daily practice and revision.',
      gradient: 'gradient-4'
    },
    {
      icon: '📈',
      title: 'Performance Analytics',
      description: 'Track your progress with detailed analytics, charts, and insights. Identify weak areas and improve.',
      gradient: 'gradient-5'
    },
    {
      icon: '📄',
      title: 'Resume Analyzer',
      description: 'AI-powered resume analysis tool that provides feedback on your resume and suggests improvements.',
      gradient: 'gradient-6'
    }
  ];

  const benefits = [
    {
      title: '🚀 Fast Track Your Career',
      description: 'Prepare comprehensively for placements with structured learning paths and targeted practice.'
    },
    {
      title: '📚 Extensive Content Library',
      description: 'Access thousands of problems and questions carefully curated by industry experts.'
    },
    {
      title: '🏆 Proven Success',
      description: 'Our users have successfully placed at top companies with competitive packages.'
    },
    {
      title: '💬 Community Support',
      description: 'Learn and grow with a community of like-minded students preparing for placements.'
    },
    {
      title: '🔄 Real-time Feedback',
      description: 'Get instant feedback on your performance and actionable insights to improve.'
    },
    {
      title: '📱 Learn Anywhere',
      description: 'Responsive design allows you to practice anytime, anywhere on any device.'
    }
  ];

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">🚀</span>
            <span className="logo-text">SmartPlace</span>
          </div>
          <div className="nav-buttons">
            <button 
              className="nav-btn nav-login"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="nav-btn nav-register"
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Master Placements with SmartPlace</h1>
          <p className="hero-subtitle">
            Your All-in-One Platform for Coding, Aptitude, and Interview Preparation
          </p>
          <p className="hero-description">
            Prepare for your dream job placement with our comprehensive learning platform. 
            Practice coding, solve aptitude questions, take mock tests, and analyze your performance.
          </p>
          <div className="hero-buttons">
            <button 
              className="btn btn-primary-hero"
              onClick={() => navigate('/register')}
            >
              Get Started Free
            </button>
            <button 
              className="btn btn-secondary-hero"
              onClick={() => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More ↓
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-illustration">
            <span className="illustration-icon">💼</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-container">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-subtitle">Everything you need to succeed in placements</p>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className={`feature-card ${feature.gradient}`}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="section-container">
          <h2 className="section-title">Why Choose SmartPlace?</h2>
          <p className="section-subtitle">Join thousands of students preparing for placements</p>
          
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Simple steps to start your preparation journey</p>
          
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Sign up with your email and create your profile. It takes just 2 minutes!</p>
            </div>
            <div className="step-divider">→</div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Choose Your Path</h3>
              <p>Select your preparation focus: Coding, Aptitude, or Mock Tests.</p>
            </div>
            <div className="step-divider">→</div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Practice & Learn</h3>
              <p>Solve problems, take quizzes, and track your progress daily.</p>
            </div>
            <div className="step-divider">→</div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Succeed</h3>
              <p>Ace your placements with confidence and land your dream job!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Placement Journey?</h2>
          <p>Join thousands of students who have successfully prepared for placements on SmartPlace</p>
          <div className="cta-buttons">
            <button 
              className="btn btn-cta-primary"
              onClick={() => navigate('/register')}
            >
              Signup Now - It's Free
            </button>
            <button 
              className="btn btn-cta-secondary"
              onClick={() => navigate('/login')}
            >
              Already Have an Account? Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>SmartPlace</h4>
            <p>Your All-in-One Placement Preparation Platform</p>
          </div>
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li><a href="#features">Coding Practice</a></li>
              <li><a href="#features">Aptitude Tests</a></li>
              <li><a href="#features">Mock Tests</a></li>
              <li><a href="#features">Analytics</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="/">Help Center</a></li>
              <li><a href="/">Contact Us</a></li>
              <li><a href="/">FAQ</a></li>
              <li><a href="/">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="/">Facebook</a>
              <a href="/">Twitter</a>
              <a href="/">LinkedIn</a>
              <a href="/">GitHub</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 SmartPlace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
