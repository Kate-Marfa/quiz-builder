import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import CreateQuizPage from '../pages/CreateQuizPage';
import QuizListPage from '../pages/QuizListPage';
import QuizDetailPage from '../pages/QuizDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <header className="site-header">
        <Link to="/quizzes" className="brand">
          <span aria-hidden="true">Q</span> Quiz Builder
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/quizzes">All quizzes</NavLink>
          <NavLink to="/create">Create quiz</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/quizzes" replace />} />
          <Route path="/create" element={<CreateQuizPage />} />
          <Route path="/quizzes" element={<QuizListPage />} />
          <Route path="/quizzes/:id" element={<QuizDetailPage />} />
          <Route
            path="*"
            element={
              <>
                <h1>Page not found</h1>
                <Link to="/quizzes">Back to quizzes</Link>
              </>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
