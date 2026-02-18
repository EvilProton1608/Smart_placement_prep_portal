import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { registerUser } from "../services/authService";

export default function Register() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleRegister = async () => {
    await registerUser(form);
    navigate("/");
  };

  return (
    <AuthLayout>
      <h2>Register</h2>
      <input placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/><br/>
      <input placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/><br/>
      <input type="password" placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})}/><br/>
      <button onClick={handleRegister}>Register</button>
    </AuthLayout>
  );
}
