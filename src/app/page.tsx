// src/app/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { generateDeviceId } from '@/utils/device';

interface DownloadResponse {
  success: boolean;
  message: string;
  downloadUrl?: string;
}

const DownloadPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState<string>('');

  // 组件加载时生成设备ID
  useEffect(() => {
    const id = generateDeviceId();
    setDeviceId(id);
  }, []);

  useEffect(() => {
    let broadcastChannel: BroadcastChannel | null = null;
    
    try {
      // 仅在浏览器环境下创建 BroadcastChannel
      if (typeof window !== 'undefined') {
        broadcastChannel = new BroadcastChannel('download_records');
        broadcastChannel.onmessage = (event) => {
          if (event.data.type === 'CLEAR_RECORDS') {
            localStorage.removeItem('downloadHistory');
          } else if (event.data.type === 'DELETE_RECORD') {
            const downloadHistory = localStorage.getItem('downloadHistory');
            if (downloadHistory) {
              const history = JSON.parse(downloadHistory);
              delete history[event.data.name];
              localStorage.setItem('downloadHistory', JSON.stringify(history));
            }
          }
        };
      }
    } catch (error) {
      console.warn('BroadcastChannel is not supported:', error);
    }

    return () => {
      // 确保在组件卸载时正确关闭通道
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, []);

  const handleDownload = async () => {
    setLoading(true);
    setError('');
  
    try {
      // 添加错误处理和状态码检查
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name,
          deviceId,
        }),
      });
  
      // 检查响应状态
      if (response.status === 405) {
        throw new Error('请求方法不允许');
      }
  
      const data: DownloadResponse = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || '请求失败');
      }
  
      if (!data.success) {
        throw new Error(data.message);
      }
  
      if (!data.downloadUrl) {
        throw new Error('下载链接无效');
      }
  
      // 使用 fetch 预检查文件是否存在
      const fileCheck = await fetch(data.downloadUrl, { method: 'HEAD' });
      if (!fileCheck.ok) {
        throw new Error('文件不存在');
      }
  
      // 创建下载链接
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = `${name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // 成功后清理状态
      setShowModal(false);
      setName('');
      setError('');
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : '下载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <button 
        onClick={() => {
          setShowModal(true);
          setError('');
        }}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        点击下载
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">请输入您的姓名</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="请输入姓名"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            {error && (
              <div className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setShowModal(false);
                  setError('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={loading}
              >
                取消
              </button>
              <button 
                onClick={handleDownload}
                disabled={!name.trim() || loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? '处理中...' : '确认下载'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadPage;