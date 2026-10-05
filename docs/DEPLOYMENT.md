# Deploy Vercel + Supabase, giữ local để phát triển

Đã publish production ngày **05/10/2026** tại [vang-trang-hoa-sac-2.vercel.app](https://vang-trang-hoa-sac-2.vercel.app). Project Vercel `le-viet-hai-quans-projects/vang-trang-hoa-sac-2`, kết nối GitHub repository hiện tại. Production/Preview đã cấu hình ba biến Supabase; server secret lưu dạng Secret. `main` là nhánh production, nhánh khác tạo Preview. Local vẫn chạy tại `http://localhost:3000`.

## Hosting

Vercel chạy Next.js FE + API. Supabase chạy PostgreSQL/Auth/Storage/Realtime. Cấu hình này phù hợp cho CLB dùng thử; chưa cần Render. Cloudflare có thể bổ sung DNS/domain. Render nên xem xét khi có worker dài hoặc server riêng.

Vercel Function giới hạn payload 4,5 MB; ảnh mới đi trực tiếp tới Storage, API chỉ nhận metadata/phiếu. [Nguồn Vercel](https://vercel.com/docs/errors/function_payload_too_large). Supabase Free cho phép global file limit tối đa 50 MB; kiểm tra **Storage → Settings → Global file size limit**. App nhận 50 MB/ảnh bài viết, 10 MB/ảnh gốc. [Nguồn Supabase](https://supabase.com/docs/guides/storage/uploads/file-limits).

## Trước deploy

```powershell
npm ci
npm run verify
git diff --stat
git status --short
```

Node.js 22.x. Kiểm tra không commit `.env`, `.env.local`, `.admin-credentials.local.txt`. `.gitignore` bảo vệ Git, `.vercelignore` bảo vệ upload CLI. Không dùng `npm audit fix --force` khi nó đổi major Next.js. Kiểm tra dependencies runtime bằng `npm audit --omit=dev`; advisory trong tooling dev cần được theo dõi riêng.

Với Supabase mới, áp dụng migration tăng dần. Với project đang vận hành, chỉ áp dụng migration còn thiếu, đặc biệt `202610050005_direct_uploads.sql`. Kiểm tra: `gallery` public, `cms-uploads` private, Realtime bảng `messages`, tài khoản Auth có ID trong `admin_users`.

## Deploy bằng GitHub

1. Review, commit và push thay đổi lên repository.
2. Vercel → Add New → Project → import `QiQi-IS-A-DEV/vang-trang-hoa-sac-2`.
3. Framework **Next.js**, Root Directory **gốc repository**, Node **22.x**.
4. Install `npm ci`, Build `npm run build`, Output Directory giữ mặc định, không đặt `out`.
5. Thêm environment variables dưới đây cho Production/Preview rồi deploy.

| Biến | Nguồn | Scope |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL Supabase | FE + BE |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable/anon key | FE + BE |
| `SUPABASE_SECRET_KEY` | Secret/service role key | Chỉ server |

Vercel không đọc `.env.local` bị ignore. Đổi `NEXT_PUBLIC_*` cần redeploy vì được đóng vào browser bundle lúc build. [Nguồn Vercel](https://vercel.com/docs/environment-variables).

Preview ghi vào database đã cấu hình. Nên dùng Supabase project test riêng khi thử xóa/ghi dữ liệu; nếu Preview dùng database CLB thì thay đổi vẫn ảnh hưởng website thật. Có thể dùng `.vercel.app` trước, chưa cần domain Cloudflare.

Build dùng `next/font/google` cần mạng tải font. Đăng nhập email/password hiện tại không yêu cầu OAuth redirect; nếu bổ sung email reset/OAuth, cấu hình Site URL/Redirect URLs trong Supabase đúng domain.

## Kiểm tra sau deploy

- Trang chủ: poster, ảnh thẻ theo ban, số liệu căn giữa, hành trình chia đoạn.
- Bài viết: có/không album, xem ảnh đầy đủ không crop.
- Cây kỷ niệm: gửi lời nhắn thử được cho phép, mở cửa sổ thứ hai kiểm tra realtime.
- Admin: login/logout, chuyển route không lặp màn chờ toàn trang, chỉnh nội dung và lưu.
- Upload một ảnh >4,5 MB để xác nhận direct upload; ảnh thẻ giữ bytes gốc, ảnh bài viết có thumbnail.
- Chỉ thử xóa trên dữ liệu được đánh dấu thử nghiệm; không chạy integration scripts tùy tiện trên database CLB.

## Giữ bản localhost

Deploy không thay thế thư mục local. Sau khi đổi cấu trúc, dừng tiến trình `next dev` cũ và chạy:

```powershell
npm run dev
```

Tiếp tục phát triển trong `D:\Project\OUH2BH\VangTrangHoaSac2`. Tạo nhánh feature → push → Vercel Preview → review → đưa lên nhánh production khi sẵn sàng. Không cần sửa production để thử UI local.

Nếu log vẫn báo `scandir .../app`, `app_dir must be a directory` hoặc router chưa khởi tạo sau khi đổi cấu trúc: dừng dev bằng Ctrl+C, chạy `npm run dev:clean`, rồi `npm run dev` và tải lại các tab localhost. Cache cũ lưu đường dẫn `app` trước khi chuyển sang `src/app`; lệnh chỉ xóa `.next/dev`, giữ nguyên mã nguồn và dữ liệu Supabase.

Lưu ý `.env.local` dùng cùng Supabase production sẽ ghi vào cùng database. Muốn thử nghiệm độc lập hoàn toàn, tạo project Supabase test, áp dụng migrations và dùng ba khóa của project test trong `.env.local`; giữ biến production riêng trên Vercel.

## Vận hành

- Upload khởi tạo lỗi: kiểm tra secret và bucket `cms-uploads` đã có migration.
- Storage từ chối dung lượng: kiểm tra global/bucket file limit.
- 413 Vercel: kiểm tra đã deploy bản direct upload; không gửi FormData ảnh lớn tới Function.
- Upload bỏ dở: dọn file `cms-uploads` cũ hơn 24 giờ trong Supabase Storage; không xóa file mới hoặc ảnh `gallery` đang dùng.
- API 401/403: kiểm tra Auth, `admin_users`, cookies HTTPS, đăng nhập lại.
- Realtime lỗi: kiểm tra publication và kết nối; project Free cần kiểm tra trạng thái/quotas trước buổi giới thiệu.

Với mỗi lần cập nhật tiếp theo, chỉ gửi CLB URL sau khi Vercel báo Ready và kiểm tra trên URL đó đã đạt. Kiểm tra bản deploy từ GitHub tương ứng với commit mới nhất trước khi giới thiệu thay đổi.
