import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div style={{ width: 200, background: "#eee", minHeight: "100vh" }}>
      <h3 style={{ padding: 10 }}>Menu</h3>
      <Link to="/dashboard">Dashboard</Link><br />
      <Link to="/aptitude">Aptitude</Link><br />
      <Link to="/coding">Coding</Link><br />
      <Link to="/analytics">Analytics</Link><br />
      <Link to="/profile">Profile</Link>
    </div>
  );
}
