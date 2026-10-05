begin;
-- An album is supplementary; cover and article content remain independent.
drop trigger if exists cms_post_album on public.posts;
drop trigger if exists cms_image_album on public.post_images;
drop function if exists public.cms_album_check();
commit;
