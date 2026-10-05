# Supabase

Project đang dùng PostgreSQL/RLS, Supabase Auth và bucket gallery. Hướng dẫn cấu hình, migration, tài khoản admin, API và kiểm thử ở [BACKEND.md](./BACKEND.md).

- Migration 001–002 được áp dụng qua SQL Editor; migration CMS 003–008 đã áp dụng qua MCP. Không chạy lại trên project hiện tại; đồng bộ lịch sử trước khi dùng CLI db push.
- Public key chỉ dành cho đọc nội dung công khai và gửi lời nhắn. Server secret chỉ nằm trong `.env.local`, không dùng biến NEXT_PUBLIC.
- Quyền admin được kiểm tra qua admin_users; phiên dùng cookies HttpOnly. Không còn mã quản trị mặc định.
- messages vẫn có trong publication supabase_realtime. Cây đọc/gửi qua /api/messages và nhận INSERT qua realtime; slot do DB cấp.
- Nhân sự, ban, vai trò, landing page, bài viết/album và assets được quản trị qua /admin. Tệp dùng chung được bảo vệ bằng khóa ngoại.
- Tài khoản đầu tiên: ouhelptobehelpedclub@ou.edu.vn; thông tin đăng nhập lưu trong `.admin-credentials.local.txt`, đã loại khỏi Git.
