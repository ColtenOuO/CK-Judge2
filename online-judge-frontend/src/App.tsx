import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CreateProblem from './pages/CreateProblem';
import ProblemManagement from './pages/ProblemManagement';
import ProblemList from './pages/ProblemList';
import ProblemDetails from './pages/ProblemDetails';
import ContestList from './pages/ContestList';
import ContestDetails from './pages/ContestDetails';
import SubmissionDetails from './pages/SubmissionDetails';
import SubmissionList from './pages/SubmissionList';
import './index.css';

function App() {
  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/problems"
          element={
            <PrivateRoute>
              <ProblemList />
            </PrivateRoute>
          }
        />
        <Route
          path="/problems/:id"
          element={
            <PrivateRoute>
              <ProblemDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/contests"
          element={
            <PrivateRoute>
              <ContestList variant="Contest" />
            </PrivateRoute>
          }
        />
        <Route
          path="/contests/:id"
          element={
            <PrivateRoute>
              <ContestDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/homeworks"
          element={
            <PrivateRoute>
              <ContestList variant="Homework" />
            </PrivateRoute>
          }
        />
        <Route
          path="/homeworks/:id"
          element={
            <PrivateRoute>
              <ContestDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/create-problem"
          element={
            <PrivateRoute>
              <CreateProblem />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/problems/:id/edit"
          element={
            <PrivateRoute>
              <ProblemManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/submissions"
          element={
            <PrivateRoute>
              <SubmissionList />
            </PrivateRoute>
          }
        />
        <Route
          path="/submissions/:id"
          element={
            <PrivateRoute>
              <SubmissionDetails />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
