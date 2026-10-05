import { CmsAdmin } from '@/components/admin/cms-admin';
import { redirect } from 'next/navigation';
export default async function AdminPage({searchParams}:{searchParams:Promise<{section?:string}>}) {
  const {section}=await searchParams;
  if(section==='cards')redirect('/admin/volunteers');
  if(section==='departments')redirect('/admin/departments');
  if(section==='categories')redirect('/admin/categories');
  if(section==='landing-sections'||section==='settings')redirect('/admin/website');
  const initialTab=['cards','assets','departments','categories','landing-sections','settings'].includes(section??'')?section:undefined;
  return <CmsAdmin key={initialTab} initialTab={initialTab}/>;
}
