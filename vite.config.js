import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// 讀取根目錄中的所有 HTML 文件
const htmlFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.html'));

// 創建輸入對象
const input = htmlFiles.reduce((acc, file) => {
  const name = file.replace('.html', '');
  acc[name] = resolve(__dirname, file);
  return acc;
}, {});

export default defineConfig({
  base: '/vite_WOWOROOM/',
  build: {
    rollupOptions: {
      input: input
    }
  }
});
