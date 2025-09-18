import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneLogin from './comonents/PhoneLogin';
import WechatLogin from './comonents/WechatLogin';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Login() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('phone'); // 'phone' | 'wechat'
  const isMobile = useIsMobile();

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

  // 切换登录方式的按钮
  const renderSwitchButton = () => (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setLoginType(loginType === 'phone' ? 'wechat' : 'phone')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border border-[#ff6600] text-[#ff6600] hover:bg-[#ff6600] hover:text-white transition-colors ${isMobile ? 'text-sm px-3 py-1.5' : 'text-base'}`}
      >
        {loginType === 'phone' ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-2.462-.96-4.779-2.705-6.526-1.747-1.746-4.066-2.711-6.533-2.713-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.099-.634z"/>
            </svg>
            <span>微信登录</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>手机登录</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="login-container">
      {/* 切换登录方式的按钮 */}
      {renderSwitchButton()}
      {loginType === 'phone' ? (
        <PhoneLogin handleLoginSuccess={handleLoginSuccess} />
      ) : (
        <WechatLogin handleLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
} 