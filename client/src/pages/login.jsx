import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";
import { loginUser } from "../services/authService";

export default function Login() {
  const [form, setForm] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await loginUser(form);
    login(res.data.token);
    navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <h2>Login</h2>
      <input placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/><br/>
      <input type="password" placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})}/><br/>
      <button onClick={handleLogin}>Login</button>
      <p>New user? <Link to="/register">Register</Link></p>
    </AuthLayout>
  );
}
