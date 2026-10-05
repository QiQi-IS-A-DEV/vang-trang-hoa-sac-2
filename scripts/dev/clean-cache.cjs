/* eslint-disable @typescript-eslint/no-require-imports */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const cache=path.resolve(root,'.next/dev');
if(!fs.existsSync(path.join(root,'src/app')))throw new Error('Không tìm thấy src/app; không xóa cache.');
if(cache!==path.join(root,'.next','dev'))throw new Error('Đường dẫn cache không hợp lệ.');
if(fs.existsSync(path.join(cache,'lock')))throw new Error('Hãy dừng npm run dev trước khi xóa cache.');
fs.rmSync(cache,{recursive:true,force:true});
console.log('Đã xóa cache dev cũ. Chạy npm run dev rồi tải lại tab localhost.');
