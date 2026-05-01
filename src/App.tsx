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

function App() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/quizzes/:quizId/questions" element={<Questions />} />
          <Route path="/redeem" element={<RedeemRequests />} />
          <Route path="/users" element={<Users />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/blogs" element={<Blogs />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
}

export default App;
