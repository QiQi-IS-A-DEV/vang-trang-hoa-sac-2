'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IconMoonOrbit } from './admin-icons';

const SessionContext=createContext<{email:string;signOut:()=>Promise<void>}|null>(null);
async function auth(method='GET',credentials?:{email:string;password:string}){
  const response=await fetch('/api/admin/auth',{method,...(credentials?{headers:{'Content-Type':'application/json'},body:JSON.stringify(credentials)}:{})});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'Không thể xác thực tài khoản.');
  return data;
}
// Kept by the shared Next layout: route changes do not restart authentication.
export function AdminSession({children}:{children:React.ReactNode}){
  const [email,setEmail]=useState(''),[password,setPassword]=useState('');
  const [checking,setChecking]=useState(true),[authenticated,setAuthenticated]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{let active=true;async function check(){try{let result;try{result=await auth();}catch{await auth('PATCH');result=await auth();}if(active){setEmail(result.user.email??'');setAuthenticated(true);}}catch{}finally{if(active)setChecking(false);}}void check();return()=>{active=false;};},[]);
  async function signOut(){await auth('DELETE');setAuthenticated(false);setPassword('');setError('');}
  if(checking)return <main className="admin-session-loading"><IconMoonOrbit size={36}/><p>Đang mở không gian quản trị…</p></main>;
  if(!authenticated)return <main className="admin-login">
    <section className="admin-login-story"><Image src="/branding/Logo_VTHS.png" alt="Vầng Trăng Hòa Sắc 2" width={120} height={120} unoptimized/><span>VẦNG TRĂNG HÒA SẮC 2</span><h2>Chăm chút những điều thương.</h2><p>Không gian dành cho những người giữ lại hình ảnh, câu chuyện và dấu ấn của mùa trăng.</p><Link href="/">← Về trang công khai</Link></section>
    <section className="admin-login-form"><span className="admin-kicker">Dành cho ban quản trị</span><h1>Chào mừng trở lại</h1><p>Đăng nhập để tiếp tục chăm chút mùa trăng.</p><form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{const result=await auth('POST',{email,password});setEmail(result.user?.email??email);setPassword('');setAuthenticated(true);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}><label>Email quản trị<input className="admin-control" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Mật khẩu<input className="admin-control" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={busy} className="admin-primary">{busy?'Đang đăng nhập…':'Đăng nhập'}</button>{error&&<p role="alert" className="admin-notice">{error}</p>}</form><small>Chỉ tài khoản được cấp quyền quản trị mới có thể truy cập.</small></section>
  </main>;
  return <SessionContext.Provider value={{email,signOut}}>{children}</SessionContext.Provider>;
}
export function useAdminSession(){const session=useContext(SessionContext);if(!session)throw new Error('Admin session must be provided by the admin layout.');return session;}
