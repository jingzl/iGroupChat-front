import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { request } from '@/utils/request';
interface PhoneLoginProps {
  onLogin: (phone: string, code: string) => void;
}

const PhoneLogin: React.FC<PhoneLoginProps> = ({ handleLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }

    //setIsLoading(true);
    try {
      const response = await fetch(`/api/sendcode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        throw new Error('发送验证码失败');
      }

      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('发送验证码失败:', error);
      alert('发送验证码失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 提交登录
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !code) {
      alert('请输入手机号和验证码');
      return;
    }

    setIsLoading(true);
    try {
      const response = await request(`/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();
      console.log(data);
      
      if (!response.ok) {
        throw new Error(data.message || '登录失败');
      }

      //执行登录成功回调
      handleLoginSuccess(data.data.token);
      
    } catch (error) {
      console.error('登录失败:', error);
      alert(error instanceof Error ? error.message : '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-4">
          <span style={{fontFamily: 'Audiowide, system-ui', color: '#ff6600'}} className="text-3xl ml-2">botgroup.chat</span>
        </div>


        <div className="text-gray-500 mb-4 text-center">
          仅支持中国大陆手机号登录
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center border rounded-lg p-3 h-[46px] focus-within:border-[#ff6600]">
              <span className="text-gray-400 mr-2">+86</span>
              <Input
                type="tel"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={11}
                className="border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0"
              />
            </div>
          </div>

          <div>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="请输入验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="border rounded-lg p-3 h-[46px] focus:border-[#ff6600] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
              />
              <Button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0 || isLoading}
                className="bg-white text-[#ff6600] border border-[#ff6600] hover:bg-[#ff6600] hover:text-white rounded-lg px-6 h-[46px]"
              >
                {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#ff6600] hover:bg-[#e65c00] text-white rounded-lg py-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : '登录'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PhoneLogin; 