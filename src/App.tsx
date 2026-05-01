import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Quizzes from './pages/Quizzes';
import Questions from './pages/Questions';
import RedeemRequests from './pages/RedeemRequests';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import Blogs from './pages/Blogs';
import Login from './pages/login/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Quizzes />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quizzes/:quizId/questions"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Questions />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/redeem"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <RedeemRequests />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Users />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Categories />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Settings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/blogs"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Blogs />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
