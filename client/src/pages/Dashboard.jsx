import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import API from "../services/api";

export default function Dashboard() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    API.get("/quiz").then(res => setQuestions(res.data));
  }, []);

  return (
    <MainLayout>
      <h2>Quiz Questions</h2>
      {questions.map(q => (
        <div key={q.id}>
          <p>{q.title}</p>
        </div>
      ))}
    </MainLayout>
  );
}
