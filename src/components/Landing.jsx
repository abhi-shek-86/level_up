import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="landing-container">
      <h1 className="landing-title">
        Welcome to Level Up!
      </h1>
      <p className="landing-desc">
        Track your learning streaks and tasks, and level up your skills every day.
      </p>
      <button
        className="landing-btn"
        onClick={() => navigate('/auth')}
      >
        Get Started
      </button>
    </div>
  );
}