# Kiến trúc FE / BE

Một ứng dụng Next.js chạy FE và API cùng origin trên Vercel. Không cần hai npm project/domain và không phát sinh CORS cho CMS.

| Thư mục | Trách nhiệm |
|---|---|
| `src/app` | Routes/pages/layouts và adapter HTTP; không đặt nghiệp vụ API tại đây |
| `src/frontend` | React UI, CSS, hooks, browser Supabase, gọi API |
| `src/backend/routes` | HTTP handlers và nghiệp vụ API |
| `src/backend/cms` | Auth, Storage, upload, nén ảnh, lỗi HTTP |
| `src/shared` | Types, schema thuần, dữ liệu mặc định; không import FE/BE |
| `supabase/migrations` | Database, RLS, functions, cấu hình bucket |

Alias `@/*` → `src/*`. API adapter export handler từ backend; cấu hình runtime/maxDuration giữ trực tiếp trong entry Next.js. Frontend không import backend; các module backend được đánh dấu `server-only`. CSS toàn cục ở `src/frontend/styles`; CSS component nằm cạnh component.

## Upload trên Vercel

1. FE gửi metadata nhỏ tới `POST /api/admin/upload`, action `initialize`.
2. BE xác minh session, quyền admin, Origin, MIME/dung lượng; cấp signed upload URL và phiếu HMAC gắn với user, hạn 15 phút.
3. Browser gửi bytes trực tiếp tới bucket riêng tư `cms-uploads` qua Supabase SDK.
4. FE gọi action `complete`. BE kiểm tra lại quyền, chữ ký, thời hạn, user, dung lượng thực tế và magic bytes.
5. Ảnh bài viết tạo WebP đầy đủ kích thước + thumbnail; ảnh thẻ/poster giữ bytes gốc. BE ghi vào `gallery`, thêm asset DB rồi dọn ảnh tạm.

Không trả secret key/JWT quản trị cho browser. Bucket staging không public. Các upload bỏ dở có thể cần dọn thủ công sau 24 giờ; phiếu cũ không dùng được sau khi ảnh đã xử lý/dọn.

## Phiên và dữ liệu

`AdminSession` nằm trong layout chung nên chuyển route không lặp màn kiểm tra đăng nhập. Đây là giữ trạng thái UI; BE vẫn kiểm tra Auth/`admin_users` trên từng request và RLS vẫn áp dụng.

Cây kỷ niệm dùng Supabase Realtime, kèm đồng bộ lại khi reconnect. Vercel không lưu file lâu dài; database và ảnh upload nằm trong Supabase. `public/` giữ ở gốc theo chuẩn Next.js. Refactor không đổi URL ảnh hoặc dữ liệu đã nhập.
