import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <div style={{ background: "#222", color: "#fff", padding: 10 }}>
      Smart Placement Portal
      <button
        onClick={logout}
        style={{ float: "right", padding: "5px 10px" }}
      >
        Logout
      </button>
    </div>
  );
}
