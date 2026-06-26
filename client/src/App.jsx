import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import BusinessList from './pages/Business/BusinessList';
import BusinessDetail from './pages/Business/BusinessDetail';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import UserDashboard from './pages/Dashboard/UserDashboard';
import ChatDashboard from './pages/Chat/ChatDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="negocios" element={<BusinessList />} />
        <Route path="negocios/:id" element={<BusinessDetail />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="chat" element={<ChatDashboard />} />
        <Route path="*" element={<div className="container flex-center" style={{minHeight:'60vh'}}><h2>Página no encontrada</h2></div>} />
      </Route>
    </Routes>
  );
}

export default App;
