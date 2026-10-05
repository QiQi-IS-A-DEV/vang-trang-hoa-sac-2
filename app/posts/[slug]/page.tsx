import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cmsClient } from '@/lib/cms/auth';
import { blockSchema } from '@/lib/cms/schema';
import { OriginalImage } from '@/components/home/original-image';
export const dynamic = 'force-dynamic';
export default async function PostPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const {data:post,error}=await cmsClient().from('posts').select('*,cover:assets!posts_cover_asset_id_fkey(url,alt,thumbnail_url),post_images(*,asset:assets(url,alt,thumbnail_url)),post_content_assets(asset_id,asset:assets(url,alt,thumbnail_url))').eq('slug',slug).eq('status','published').maybeSingle();
  if(error)throw new Error('Không thể tải bài viết.');if(!post)notFound();
  const blocks=Array.isArray(post.content)?post.content:[];
  return <main className="site-shell story-page"><article className="story-inner"><Link href="/posts" className="text-link">← Tin tức & dấu ấn mùa trăng</Link><header className="story-header"><h1>{post.title}</h1><p>{post.excerpt}</p></header><div className="story-body">
    {post.cover&&<OriginalImage naturalSize showLabel={false} src={post.cover.url} thumbnailSrc={post.cover.thumbnail_url} alt={post.cover.alt || post.title} className="story-photo"/>}
    {blocks.map((raw,i)=>{const parsed=blockSchema.safeParse(raw);if(!parsed.success)return null;const b=parsed.data;if(b.type==='paragraph')return <p key={i}>{b.text}</p>;if(b.type==='heading')return <h2 key={i}>{b.text}</h2>;if(b.type==='list')return <ul key={i}>{b.items.map((s,j)=><li key={j}>{s}</li>)}</ul>;const asset=post.post_content_assets.find(a=>a.asset_id===b.asset_id)?.asset;return asset?<figure key={i}><OriginalImage naturalSize showLabel={false} src={asset.url} thumbnailSrc={asset.thumbnail_url} alt={asset.alt || b.caption || post.title} className="story-photo"/>{b.caption&&<figcaption>{b.caption}</figcaption>}</figure>:null;})}
    {post.post_images.length>0&&<><h2>Album ảnh</h2><div className="news-grid">{post.post_images.sort((a,b)=>a.sort_order-b.sort_order||a.id.localeCompare(b.id)).map(a=>a.asset&&<figure key={a.id}><OriginalImage naturalSize showLabel={false} src={a.asset.url} thumbnailSrc={a.asset.thumbnail_url} alt={a.asset.alt || a.caption || post.title} className="volunteer-photo"/>{a.caption&&<figcaption>{a.caption}</figcaption>}</figure>)}</div></>}
    </div><Link href="/posts" className="text-link mt-12">Khám phá các bài viết khác</Link></article></main>;
}
