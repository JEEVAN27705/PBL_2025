import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ChatArea from './components/ChatArea.jsx';
import Terms from './components/Terms.jsx'; // add this import

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chat" element={<ChatArea />} />
      <Route path="/terms" element={<Terms />} /> {/* new terms route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
