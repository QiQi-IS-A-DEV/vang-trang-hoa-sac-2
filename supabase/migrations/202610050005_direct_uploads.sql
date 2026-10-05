-- Private staging bucket. Only admin-issued signed upload URLs may write.
-- No anonymous/public SELECT or INSERT policy is added for this bucket.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('cms-uploads','cms-uploads',false,52428800,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
