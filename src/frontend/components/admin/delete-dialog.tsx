"use client";
import { useEffect, useRef, useState, type ReactNode } from 'react';

export function DeleteDialog({title,description,children,onDelete,onClose}:{title:string;description:string;children?:ReactNode;onDelete:()=>Promise<void>;onClose:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{dialog.current?.showModal();},[]);
  return <dialog ref={dialog} className="admin-delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={e=>{if(busy)e.preventDefault();}} onClose={onClose}>
    <h2 id="delete-title">{title}</h2><p id="delete-description">{description}</p>
    <fieldset disabled={busy}>{children}</fieldset>
    {error&&<p role="alert" className="admin-notice">{error}</p>}
    <div className="admin-delete-actions"><button className="admin-secondary" disabled={busy} autoFocus onClick={()=>dialog.current?.close()}>Hủy</button><button className="admin-delete-confirm" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await onDelete();onClose();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>{busy?'Đang xóa…':'Xác nhận xóa'}</button></div>
  </dialog>;
}
