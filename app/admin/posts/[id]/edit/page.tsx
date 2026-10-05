import { notFound } from 'next/navigation';
import { CmsAdmin } from '@/components/admin/cms-admin';
import { uuid } from '@/lib/cms/schema';
export default async function Page({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(!uuid.safeParse(id).success)notFound();
  return <CmsAdmin postView="edit" postId={id}/>;
}
