import { notFound } from 'next/navigation';
import { CmsAdmin } from '@/components/admin/cms-admin';
const views=['hero','team','volunteers','recap','footer','brand','memories'];
export const dynamicParams=false;
export function generateStaticParams(){return views.map(view=>({view}));}
export default async function Page({params}:{params:Promise<{view:string}>}){
  const {view}=await params;
  if(!views.includes(view))notFound();
  return <CmsAdmin key={view} websiteView={view}/>;
}
