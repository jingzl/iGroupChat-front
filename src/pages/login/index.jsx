import React from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneLogin from './comonents/PhoneLogin';

export default function Login() {
  const navigate = useNavigate();

  const handleLoginSuccess = (token) => {
    localStorage.setItem('token', token);
    navigate('/');
  };

  React.useEffect(() => {
    const isLogin = localStorage.getItem('token');
    if (isLogin) {
      window.location.href = '/';  // 由于是 Vite 多页面，这里使用 window.location.href
    }
  }, []);

  return (
    <div className="login-container">
      <PhoneLogin handleLoginSuccess={handleLoginSuccess} />
    </div>
  );
} 