import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Edit2Icon, LogOutIcon, CheckIcon, XIcon } from 'lucide-react';
import { request } from '@/utils/request';
import { useUserStore } from '@/store/userStore';
import { getAvatarData } from '@/utils/avatar';
import { toast } from 'sonner';

interface UserSectionProps {
  isOpen: boolean;
}


export const UserSection: React.FC<UserSectionProps> = ({ isOpen }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userStore = useUserStore();

  // 添加更新昵称的函数
  const updateNickname = async () => {
    if (!newNickname.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await request('/api/user/update', {
        method: 'POST',
        body: JSON.stringify({ nickname: newNickname.trim() })
      });
      const { data } = await response.json();
      //更新用户信息
      userStore.setUserInfo(data);
      toast.success('更新昵称成功');
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新昵称失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 添加上传头像的处理函数
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      
      // 1. 首先从后端获取上传 URL
      const response = await request('/api/user/upload', {
        method: 'POST'
      });
      const { data: uploadData } = await response.json();
      const uploadURL = uploadData.uploadURL;
      const id = uploadData.id;

      
      // 2. 上传图片到 Cloudflare Images
      const formData = new FormData();
      formData.append('file', file); // 使用 'file' 作为字段名

      await fetch(uploadURL, {
        method: 'POST',
        body: formData
      });

      // 3. 更新用户头像信息
      const updateResponse = await request('/api/user/update', {
        method: 'POST',
        body: JSON.stringify({ avatar_url: id })
      });
      
      const { data } = await updateResponse.json();
      userStore.setUserInfo(data);
      
    } catch (error) {
      console.error('上传头像失败:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!isOpen || !userStore.userInfo || !userStore.userInfo.status) return null;
  
  return (
    <div 
      className={cn(
        "px-3 py-3 border-t border-b border-border/40 h-20",
        "flex items-center gap-3 hover:bg-accent/50 transition-colors"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* 头像区域 */}
      <div className="relative group cursor-pointer">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleAvatarUpload}
        />
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm overflow-hidden"
          style={{ backgroundColor: getAvatarData(userStore.userInfo?.nickname || '我').backgroundColor }}
          onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
        >
          {uploadingAvatar ? (
            <div className="flex items-center justify-center w-full h-full bg-black/20">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : userStore.userInfo?.avatar_url ? (
            <img 
              src={`${userStore.userInfo.avatar_url}`}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span 
              className="text-base font-medium text-white"
            >
              {getAvatarData(userStore.userInfo?.nickname || '我').text}
            </span>
          )}
        </div>
        {/* 头像hover效果 */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full bg-black/40 flex items-center justify-center transition-opacity",
            uploadingAvatar ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
          )}
          onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
        >
          <Edit2Icon className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* 用户信息区域 */}
      <div className="flex flex-col relative flex-1">
        <div className="flex items-center  group cursor-pointer">
          {isEditing ? (
            <div className="flex flex-col">
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className="text-sm px-2  border rounded-md w-full"
                placeholder={userStore.userInfo?.nickname || '输入新昵称'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateNickname();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                autoFocus
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={updateNickname}
                  className="p-1 hover:bg-emerald-50 rounded-md transition-colors"
                  title="保存"
                >
                  <CheckIcon className="w-4 h-4 text-emerald-600 hover:text-emerald-500" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 hover:bg-rose-50 rounded-md transition-colors"
                  title="取消"
                >
                  <XIcon className="w-4 h-4 text-rose-600 hover:text-rose-500" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                {isLoading ? '加载中...' : userStore.userInfo?.nickname || '游客用户'}
              </span>
              <Edit2Icon 
                className={cn(
                  "w-3 h-3 text-muted-foreground/50",
                  "opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                )}
                onClick={() => {
                  setIsEditing(true);
                  setNewNickname(userStore.userInfo?.nickname || '');
                }}
              />
            </>
          )}
        </div>
        
        {/* 退出登录按钮 */}
        {!isEditing && (
          <div 
            className={cn(
              "flex items-center gap-0.5 mt-1 text-xs text-muted-foreground/70",
              "hover:text-rose-500 transition-all duration-200 group",
              "rounded-md cursor-pointer"
            )}
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
          >
            <LogOutIcon 
              className={cn(
                "w-3 h-3",
                "group-hover:animate-pulse"
              )} 
            />
            <span className="group-hover:tracking-wide transition-all duration-200">
              退出登录
            </span>
          </div>
        )}
      </div>
    </div>
  );
}; 