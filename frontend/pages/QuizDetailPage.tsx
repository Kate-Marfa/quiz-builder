import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import QuestionAnswer from '../components/QuestionAnswer';
import { api, errorMessage } from '../services/api';
import type { Quiz } from '../services/types';

export default function QuizDetailPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api
      .get(id!, controller.signal)
      .then(setQuiz)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      });
    return () => controller.abort();
  }, [id]);

  return (
    <>
      <Link className="back-link" to="/quizzes">
        ← All quizzes
      </Link>
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : !quiz ? (
        <p role="status">Loading quiz…</p>
      ) : (
        <>
          <div className="page-heading">
            <div>
              <p className="eyebrow">QUIZ DETAILS</p>
              <h1>{quiz.title}</h1>
              <p>{quiz.questions.length} questions · Read-only preview</p>
            </div>
          </div>
          <div className="question-list">
            {quiz.questions.map((question, index) => (
              <section className="panel" key={index}>
                <div className="question-heading">
                  <span className="question-number">{index + 1}</span>
                  <span className="tag">
                    {question.type === 'boolean'
                      ? 'True / False'
                      : question.type === 'input'
                        ? 'Short answer'
                        : 'Multiple choice'}
                  </span>
                </div>
                <h2>{question.text}</h2>
                <QuestionAnswer question={question} index={index} />
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}
