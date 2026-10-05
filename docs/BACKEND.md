# Backend — Vầng Trăng Hòa Sắc 2

Đã triển khai backend theo `BUSINESS-REQUIREMENTS.md`: Supabase Auth, PostgreSQL/RLS, Storage và Next.js Route Handlers. Trang `/admin` dùng các API này; trang chủ và bộ sưu tập dùng dữ liệu đã lưu trong DB. Không còn mã quản trị mặc định, `x-admin-key`, ghi đè JSON trên máy chủ hoặc báo thành công khi DB thất bại.

## Thiết lập

Các biến môi trường nằm trong `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

Secret chỉ dùng phía server cho Storage và thư viện ảnh, sau khi kiểm tra quyền admin. Các truy vấn nội dung dùng JWT của admin và vẫn chịu RLS. Request công khai dùng public key.

Project mới: chạy tất cả migration trong `supabase/migrations/` theo thứ tự tên, rồi `npm run import:cms` nếu cần chuyển dữ liệu giao diện cũ. Script import dùng ID ổn định, không ghi đè bản ghi đã chỉnh sửa; ảnh cục bộ chỉ nhập khi tệp thực sự tồn tại. Cùng một tên đầy đủ trong dữ liệu cũ được nối vào một hồ sơ. Ban viết tắt được nối vào ban đầy đủ khi có đúng một kết quả khớp. Dữ liệu gốc có nhiều thông tin mẫu; admin cần thay bằng thông tin thực tế.

Project hiện tại: migration 001–002 đã được chạy qua SQL Editor; 003–008 đã áp dụng qua MCP trong lần hoàn thiện này. Nội dung cũ đã được nhập và các danh mục đã được khởi tạo. Không chạy lại các migration trên project hiện tại. Phải đồng bộ lịch sử phiên bản local/remote trước khi dùng `supabase db push`, vì MCP cấp timestamp migration riêng.

## Admin

Tài khoản đầu tiên: `ouhelptobehelpedclub@ou.edu.vn`. Mật khẩu được lưu riêng trong `.admin-credentials.local.txt`, đã loại khỏi Git, không được đưa vào mã nguồn/frontend. Đây là tài khoản tạo qua Auth Admin API, không gửi thư mời/email. Có thể đổi mật khẩu qua Supabase Auth Dashboard.

Tạo admin tiếp theo:

```powershell
node scripts/create-admin.cjs your@email.com
```

Script yêu cầu nhập mật khẩu không hiển thị. Nó tạo tài khoản Auth rồi thêm ID vào `admin_users`. Nếu đã có tài khoản Auth, cấp quyền bằng SQL Editor:

```sql
insert into public.admin_users(user_id)
select id from auth.users where email = 'your@email.com'
on conflict do nothing;
```

Không có đăng ký admin công khai. Xóa ID khỏi `admin_users` thu hồi quyền ngay cả khi phiên đăng nhập còn hạn.

| Endpoint | Hợp đồng |
|---|---|
| `POST /api/admin/auth` | `{ email, password }`; đăng nhập và kiểm tra allowlist admin |
| `GET /api/admin/auth` | Kiểm tra phiên; trả ID/email, không trả token |
| `PATCH /api/admin/auth` | Làm mới phiên bằng refresh cookie và kiểm tra lại quyền |
| `DELETE /api/admin/auth` | Đăng xuất, thu hồi refresh session và xóa cookies |

Access/refresh tokens nằm trong cookies HttpOnly, SameSite=Strict; Secure khi chạy production qua HTTPS. Các mutation dùng cookie yêu cầu `Origin` khớp với origin của request. Supabase Auth thực hiện kiểm tra mật khẩu; API xác minh user bằng `getUser`, sau đó kiểm tra `admin_users` ở mỗi thao tác. Tham khảo [Supabase getUser](https://supabase.com/docs/reference/javascript/auth-getuser) và [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## API nội dung

API trả `Cache-Control: no-store`. Lỗi có `{ error }`; validation có thêm `fields`; lỗi ảnh đang dùng có `usages`. Mã chính: 400 dữ liệu sai, 401 thiếu/hết phiên, 403 trái quyền/Origin, 404 không tìm thấy, 409 liên kết/xung đột, 413 quá lớn, 415 sai định dạng, 503 dịch vụ chưa sẵn sàng. Body JSON CMS tối đa 512 KB, đăng nhập tối đa 4 KB. Không trả lỗi SQL nội bộ.

### Landing page

- `GET /api/settings`: cấu hình công khai, URL logo/background.
- `POST /api/settings`: admin cập nhật từng trường cấu hình; merge tại DB dưới khóa hàng, tránh mất cập nhật đồng thời.
- `GET /api/landing-sections`: các khu vực đang bật, theo thứ tự.
- `/api/admin/landing-sections`: quản trị khu vực. Các key hỗ trợ: hero, advisors, organizers, departments, volunteers, recap, footer. Có tiêu đề, mô tả, ảnh, enabled, sort_order, content chứa stats/journey.
- Trang chủ lấy thứ tự/bật tắt từ DB; các khu vực nhân sự đọc cùng hồ sơ/phân công, không nhập bản sao riêng.

### Nhân sự và danh mục

Các resource `/api/admin/people`, `/api/admin/departments`, `/api/admin/assignments`, `/api/admin/categories`, `/api/admin/landing-sections` hỗ trợ:

- GET: `?limit=24&offset=0`, trả `{items,next_offset}`; limit 1–100.
- POST: tạo một bản ghi từ các trường hợp lệ, trả `{item}`, status 201.
- PATCH: `?id=<uuid>`, body chỉ chứa các trường cần đổi.
- DELETE: `?id=<uuid>`; chặn xóa ban/danh mục còn liên kết.

`people` lưu họ tên, code, unit, quote, badge, asset_id, visible, sort_order. `departments` lưu name, code, description, visible, sort_order. `assignments` nối person_id với department_id và role: advisor, organizer, lead, deputy, volunteer; có title, responsibility, visible, sort_order. Trưởng/phó phải có ban; một người có thể có nhiều vai trò; nhiều phó ban được phép. Xóa hồ sơ gỡ các phân công của hồ sơ đó; không xóa ảnh.

`GET /api/team` chuyển mô hình chuẩn hóa về cấu trúc giao diện hiện có: advisors, organizers, departments/members, volunteers. Tên ban luôn lấy từ liên kết department_id. Hồ sơ/ban/phân công đã ẩn không xuất hiện công khai. `GET /api/categories` trả danh mục có thứ tự; “Tất cả” chỉ là bộ lọc giao diện.

### Bài viết và album

- `GET /api/posts?category=<uuid>&limit=24&offset=0`: bài đã đăng, mô tả ngắn và ảnh bìa.
- `GET /api/posts/<slug>`: bài đã đăng, toàn bộ nội dung và album; nháp/gỡ đăng trả 404.
- `GET /api/admin/posts`: toàn bộ trạng thái, phân trang; có thể lọc `?id=<uuid>`.
- `POST /api/admin/posts`: tạo bài và album.
- `PUT /api/admin/posts?id=<uuid>`: lưu bài và thay album trong một giao dịch.
- `DELETE /api/admin/posts?id=<uuid>`: xóa bài và liên kết album; giữ các tệp ảnh.

Body tạo/lưu: title, category_id, album bắt buộc; slug, excerpt, content, cover_asset_id, status, sort_order tùy chọn. Khi sửa mà không gửi slug, giữ đường dẫn hiện tại. Slug tự sinh từ tiêu đề kèm hậu tố khi tạo. Nếu gửi slug trùng, trả 409. Album gồm `{asset_id,caption?,sort_order?}`. Để đăng, bài cần ảnh bìa và ít nhất một ảnh album; DB kiểm tra cả trường hợp xóa/chuyển ảnh cuối. Lỗi ở bất kỳ phần nào rollback toàn bộ bài/album.

Nội dung là các block:

```json
[
  {"type":"heading","text":"Đêm hội"},
  {"type":"paragraph","text":"Nội dung hoạt động..."},
  {"type":"list","items":["Hoạt động 1","Hoạt động 2"]},
  {"type":"image","asset_id":"UUID ảnh","caption":"Chú thích"}
]
```

Trang `/posts/<slug>` render văn bản bằng React và chỉ nhận block hợp lệ; không render HTML tùy ý. Ảnh trong block được liên kết bằng FK qua `post_content_assets`, bao gồm cả ảnh của bài nháp.

### Ảnh

- `POST /api/admin/upload`: multipart `file`, `alt?`; JPEG, PNG, WebP; tối đa 10 MB. Kiểm tra MIME và chữ ký tệp; giới hạn cả request stream. Tên/path do server cấp bằng UUID, không dùng folder/path của client; không overwrite, không fallback sang file cục bộ.
- `GET /api/admin/assets`: thư viện ảnh có phân trang.
- `PATCH /api/admin/assets?id=<uuid>`: `{alt}`.
- `DELETE /api/admin/assets?id=<uuid>`: trả 409 và các vị trí tham chiếu nếu ảnh đang được dùng. FK bảo vệ trường hợp có liên kết mới giữa lúc kiểm tra/xóa.
- `POST /api/admin/storage-cleanup`: chạy lại tối đa 100 tác vụ xóa tệp còn tồn. Nếu xóa Storage tạm thất bại sau khi gỡ metadata, API trả `cleanup_pending:true`; DB giữ tác vụ để chạy lại. Không xóa các ảnh được đóng gói sẵn trong public.

Bucket gallery công khai để hiển thị ảnh; không cấp upload cho client công khai. Không dùng public key để mutate assets metadata. Ảnh có thể được chia sẻ giữa nhiều bài/khu vực; xóa bài không xóa tài sản.

`GET /api/gallery` giữ endpoint đọc gallery_images cũ, có lọc/phân trang; đã loại bỏ POST/DELETE bằng passcode. Giao diện bộ sưu tập mới dùng `/api/posts`.

## Cây kỷ niệm

- `GET /api/messages?limit=100&after=123`: slot tăng dần, limit 1–500, `{items,next_cursor}`.
- `POST /api/messages`: author_name, role_team?, message, leaf_type lantern/star; body tối đa 16 KB; không nhận ID, slot, timestamp hoặc tệp.
- Tên 1–80 ký tự, ban tối đa 80, lời nhắn 1–1.000; trim và chuẩn hóa ban trống thành null ở API/DB.
- Slot do identity sequence cấp, không trùng khi gửi đồng thời, có thể có khoảng trống. Giao diện chia 70 slot/tán; tải toàn bộ trang theo cursor và deduplicate ID.
- Realtime dùng `postgres_changes_options.wait=true`, chỉ báo sẵn sàng sau khi subscription database hoạt động; tải lại sau subscribe/reconnect, khi focus và định kỳ nếu realtime gián đoạn. Tham khảo [Supabase realtime troubleshooting](https://supabase.com/docs/guides/troubleshooting/realtime-postgres-changes-troubleshooting).
- Công khai được đọc/gửi ngay, không kiểm duyệt trước, không giới hạn một lời nhắn mỗi người. Update/delete vẫn bị chặn. `/api/admin/messages` không cung cấp chức năng xóa vì nằm ngoài phạm vi nghiệp vụ đã chốt.

## Kiểm thử

```powershell
npm run lint
npm run build
node node_modules/next/dist/bin/next start -p 3001
# Chạy ở terminal khác:
$env:TEST_BASE_URL='http://localhost:3001'
npm run check:cms
npm run check:backend
```

Hai script integration cần public credentials và server secret để tạo/dọn dữ liệu kiểm thử có marker/ID riêng. CMS test tạo tài khoản test riêng, kiểm tra đăng nhập, thiếu quyền, CSRF, validation, nháp/đăng/gỡ đăng, slug ổn định, album/rollback, ảnh dùng chung, cấu hình trang, đổi tên ban, nhiều vai trò và thu hồi admin. Các cấu hình bị sửa tạm được khôi phục trong finally. Message test kiểm tra realtime bằng client thứ hai, gửi đồng thời, 72 lời nhắn vượt sức chứa tán, phân trang và quyền DB; dọn các lời nhắn theo ID lẫn marker.

Kiểm thử đã chạy thành công trên project được cấu hình. Không có dữ liệu kiểm thử được giữ lại. Deploy frontend/Next.js lên hosting chưa được thực hiện; migration DB và dữ liệu khởi tạo đã được áp dụng.

## Ghi chú kiểm tra Supabase

Đã thu hồi quyền RPC công khai của các trigger helper và bổ sung index cho các FK. Cảnh báo [security definer của is_admin](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) là chủ ý: hàm không nhận ID từ client, chỉ trả quyền của auth.uid hiện tại và được dùng trong RLS. [storage_cleanup không có policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) cũng là chủ ý: chỉ service role xử lý hàng đợi này, anon/authenticated không có grant. Project hiện chưa bật [kiểm tra mật khẩu đã rò rỉ](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) trong cấu hình Auth; mật khẩu admin đầu tiên được sinh ngẫu nhiên, không dùng mật khẩu mặc định.
