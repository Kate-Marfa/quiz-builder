import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../services/api';
import type { QuizSummary } from '../services/types';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .list(controller.signal)
      .then(setQuizzes)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function remove(id: string) {
    setDeleting((current) => [...current, id]);
    setError('');
    try {
      await api.remove(id);
      setQuizzes((current) => current.filter((quiz) => quiz.id !== id));
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setDeleting((current) => current.filter((item) => item !== id));
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR COLLECTION</p>
          <h1>All quizzes</h1>
          <p>Create a quiz, then explore its questions.</p>
        </div>
        <Link className="button primary" to="/create">
          + Create quiz
        </Link>
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Loading quizzes…</p>
      ) : quizzes.length === 0 ? (
        <section className="empty-state">
          <h2>No quizzes yet</h2>
          <p>Add your first quiz to get started.</p>
          <Link className="button primary" to="/create">
            Create a quiz
          </Link>
        </section>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <article className="quiz-card" key={quiz.id}>
              <span className="tag">
                {quiz.questionCount}{' '}
                {quiz.questionCount === 1 ? 'question' : 'questions'}
              </span>
              <h2>
                <Link to={`/quizzes/${quiz.id}`}>{quiz.title}</Link>
              </h2>
              <div className="card-footer">
                <Link to={`/quizzes/${quiz.id}`}>
                  View quiz <span aria-hidden="true">↗</span>
                </Link>
                <button
                  className="icon-button danger"
                  aria-label={`Delete ${quiz.title}`}
                  title="Delete quiz"
                  disabled={deleting.includes(quiz.id)}
                  onClick={() => void remove(quiz.id)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    aria-hidden="true"
                  >
                    <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
