/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import React, { useEffect, useState } from 'react'
import '@/css/app.css'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { ErrorDisplay, initErrorLogging, scanReactPlugin, logVitePluginError } from '@/lib/error-logger'
import axios from 'axios'

// Cấu hình Axios để tự động gửi CSRF token
axios.defaults.withCredentials = true

// Lấy CSRF token từ meta tag
const csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
if (csrfToken) {
  axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken
  console.log('Đã cấu hình CSRF token:', csrfToken)
} else {
  console.warn('Không tìm thấy CSRF token trong meta tags')
}

// Khởi tạo hệ thống log lỗi
initErrorLogging();

// Đặt DEBUG vào window để truy cập từ console
window.DEBUG = {
  showReactVersionInfo: () => {
    console.info('React version:', React.version);
    
    // Không truy cập trực tiếp đến package.json vì điều này gây lỗi khi Vite quét dependencies
    try {
      // @ts-ignore
      console.info('React DOM version:', require('react-dom').version || 'N/A');
    } catch (error) {
      console.info('React DOM version: Không thể xác định');
    }
    
    console.info('Environment:', import.meta.env.MODE);
    console.info('Node Env:', import.meta.env.NODE_ENV);
    
    // Thêm thông tin debug về Vite
    console.info('Vite HMR:', import.meta.hot ? 'Enabled' : 'Disabled');
    
    // Kiểm tra các plugin đã tải
    console.info('Loaded scripts:', 
      Array.from(document.querySelectorAll('script'))
        .map(s => s.src || `[inline] ${s.type || 'unknown type'}`)
        .join('\n')
    );
  },
  
  // Thêm các hàm debug mới từ error-logger
  scanVitePlugin: () => {
    const result = window.ErrorLogger?.scanReactPlugin();
    console.info('Vite Plugin Scan:', result);
    return result;
  },
  
  logViteError: (message: string) => {
    window.ErrorLogger?.logVitePluginError(message || 'Manual debug report');
  }
};

// Thêm tham chiếu vào window để gọi được từ console
declare global {
  interface Window {
    DEBUG: {
      showReactVersionInfo: () => void;
      scanVitePlugin: () => Record<string, any> | undefined;
      logViteError: (message: string) => void;
    };
    ErrorLogger?: {
      scanReactPlugin: () => Record<string, any>;
      logVitePluginError: (message: string) => Record<string, any>;
    };
  }
}

// Thêm error-logger vào window
window.ErrorLogger = {
  scanReactPlugin: scanReactPlugin,
  logVitePluginError: logVitePluginError
};

// Phát hiện lỗi plugin React và ghi log
if (typeof window !== 'undefined') {
  try {
    // Kiểm tra xem plugin React có hoạt động không
    const vitePluginTest = document.querySelector('script[type="module"]');
    
    // Nếu không tìm thấy plugin React, ghi log
    if (!vitePluginTest || !vitePluginTest.textContent?.includes('@vitejs/plugin-react')) {
      console.warn('Không phát hiện Vite React plugin trong script tags');
      
      // Tự động ghi log vấn đề
      setTimeout(() => {
        window.ErrorLogger?.logVitePluginError('Không phát hiện preamble của plugin React');
      }, 1000);
    }
  } catch (e) {
    console.error('Lỗi khi kiểm tra plugin React:', e);
  }
}

const appName = import.meta.env.VITE_APP_NAME || 'ShadcnAdmin'

// Wrapper component để xử lý lỗi
class ErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error trong ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          fontFamily: 'sans-serif'
        }}>
          <h2>Lỗi React</h2>
          <div>{this.state.error?.message || 'Đã xảy ra lỗi không xác định'}</div>
          {this.state.error?.stack && (
            <pre style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.error.stack}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#0d6efd',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createInertiaApp({
  progress: { color: '#5468FF' },
  title: (title) => `${title} - ${appName}`,
  
  resolve: (name) => {
    console.log('Đang tải trang:', name);
    try {
      return resolvePageComponent(`../pages/${name}.tsx`, import.meta.glob('../pages/**/*.tsx'))
    } catch (error) {
      console.error('Lỗi khi resolve page component:', error);
      throw error;
    }
  },
  
  setup({ el, App, props }) {
    try {
      console.log('Đang thiết lập Inertia app với props:', JSON.stringify(props, null, 2));
      
      const root = createRoot(el);
      
      root.render(
        <ErrorBoundary>
          <>
            <App {...props} />
            <ErrorDisplay />
          </>
        </ErrorBoundary>
      );
    } catch (error) {
      console.error('Lỗi khi thiết lập Inertia app:', error);
      
      // Hiển thị lỗi trực tiếp trong trường hợp khẩn cấp
      el.innerHTML = `
        <div style="padding: 20px; background-color: #f8d7da; color: #721c24; border-radius: 4px;">
          <h2>Lỗi khởi tạo ứng dụng</h2>
          <div>${error?.message || 'Không thể khởi tạo ứng dụng React'}</div>
          <pre style="margin-top: 10px; padding: 10px; background-color: rgba(0,0,0,0.1); overflow: auto;">${error?.stack || ''}</pre>
        </div>
      `;
    }
  },
}) 