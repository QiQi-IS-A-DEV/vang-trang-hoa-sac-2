# Vầng Trăng Hòa Sắc 2

**Bản dùng thử:** [Website](https://vang-trang-hoa-sac-2.vercel.app) · [Quản trị](https://vang-trang-hoa-sac-2.vercel.app/admin). Đã publish ngày 05/10/2026. Local tiếp tục chạy bằng `npm run dev`.

Website CLB OU Help To Be Helped: giới thiệu chương trình, thẻ tình nguyện viên, tin tức và cây kỷ niệm có lời nhắn realtime.

## Công nghệ

FE: React 19, TypeScript, Tailwind CSS 4, Next.js App Router. BE: Next.js Route Handlers/Node.js, Zod, Sharp. Dữ liệu: Supabase PostgreSQL, Auth, Storage và Realtime. Hosting: Vercel cho FE + API, Supabase cho dữ liệu và ảnh; một repository, một lần deploy.

## Cấu trúc dự án

```text
src/
  app/                     Routes/layouts Next.js, API adapters
    api/                   Export HTTP handlers từ backend
    admin/                 Routes quản trị
    memories/              Trang cây kỷ niệm
    posts/                 Trang bài viết
  frontend/
    components/            Giao diện public, admin, cây kỷ niệm, UI
    lib/                   Hooks, API client, Supabase browser, direct upload
    styles/                CSS chung và dashboard
  backend/
    routes/                HTTP handlers public/admin và nghiệp vụ API
    cms/                   Auth, Storage, upload, xử lý ảnh, lỗi API
    supabase/              Supabase client chỉ chạy trên server
  shared/
    data/                  Nội dung mặc định, poster, vị trí trên cây
    types/                 TypeScript/database types
    validation/            Schema CMS dùng chung FE/BE
    memories/              Validation lời nhắn
public/                    Ảnh/âm thanh tĩnh, giữ chất lượng gốc
supabase/migrations/       Schema, RLS, Storage, database functions
scripts/admin/             Tạo admin, import, bảo trì
scripts/checks/            Kiểm tra tích hợp và điều kiện deploy
docs/                      Kiến trúc, nghiệp vụ, deploy, bàn giao
```

Alias `@/*` trỏ vào `src/*`. FE không import backend; backend có `server-only`. `src/app/api` là adapter bắt buộc của Next.js, logic nằm trong `src/backend/routes`. Các URL giữ nguyên. Xem [kiến trúc](docs/ARCHITECTURE.md).

## Chạy tại máy

Yêu cầu **Node.js 22.x**, npm và Supabase đã thiết lập.

```powershell
git clone https://github.com/QiQi-IS-A-DEV/vang-trang-hoa-sac-2.git
cd vang-trang-hoa-sac-2
npm ci
Copy-Item .env.local.example .env.local
```

Điền ba biến trong `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_SECRET_KEY=your-supabase-server-secret
```

Hai biến `NEXT_PUBLIC_*` dùng trong browser. Secret chỉ dùng trên server; không commit `.env`, `.env.local` hoặc file mật khẩu quản trị. Với database mới, áp dụng migration tăng dần. Với database đang dùng, chỉ áp dụng migration còn thiếu; không reset/seed lại dữ liệu CLB.

```powershell
npm run dev
```

Mở [localhost:3000](http://localhost:3000). Sau khi chuyển cấu trúc thư mục, dừng tiến trình dev cũ rồi chạy lại. Bản local luôn được giữ để phát triển, không phụ thuộc vào việc đã deploy Vercel.

## Routes

| Route | Nội dung |
|---|---|
| `/` | Trang chủ, poster, thẻ theo ban, số liệu, hành trình |
| `/memories` | Cây kỷ niệm, gửi/đọc lời nhắn realtime |
| `/posts`, `/posts/<slug>` | Tin tức, bài viết; album không bắt buộc |
| `/admin` | Đăng nhập, tổng quan |
| `/admin/volunteers` | Upload thẻ hoàn chỉnh, ban, vai trò |
| `/admin/departments`, `/admin/categories` | Các ban, danh mục |
| `/admin/posts`, `/admin/posts/new`, `/admin/posts/<id>/edit` | Biên tập bài viết |
| `/admin/website` | Bố cục, bật/tắt, thứ tự, nút Chỉnh sửa |
| `/admin/website/{hero,team,volunteers,recap,footer}` | Chỉnh từng khu vực trang chủ |
| `/admin/website/brand` | Logo và ảnh nền chung |
| `/admin/website/memories` | Lời mở đầu, hướng dẫn, lời kết cây kỷ niệm |

Ảnh thẻ/poster giữ bytes gốc, tối đa 10 MB/ảnh. Ảnh bài viết upload trực tiếp lên Supabase; backend tạo WebP đầy đủ kích thước và thumbnail, xem ảnh không crop. Cấu hình dùng thử hỗ trợ 50 MB/ảnh bài viết; kiểm tra Storage global limit tương ứng. Bytes ảnh lớn không đi qua Vercel Function.

## Lệnh

| Lệnh | Chức năng |
|---|---|
| `npm run dev` | Phát triển local |
| `npm run dev:clean` | Xóa cache dev sau khi dừng server, dùng khi đổi cấu trúc thư mục |
| `npm run build`, `npm start` | Build/chạy production |
| `npm run lint`, `npm run typecheck` | ESLint, TypeScript |
| `npm run verify` | Kiểm tra điều kiện deploy, lint, build |
| `npm run admin:create -- admin@example.com` | Tạo admin, nhập mật khẩu trong terminal |
| `npm run import:cms` | Nhập dữ liệu ban đầu, không ghi đè nội dung CLB |
| `npm run check:website`, `npm run check:uploads` | Kiểm tra website CMS/direct upload |
| `npm run check:cms`, `npm run check:backend`, `npm run check:deletion` | Kiểm tra tích hợp |

Integration scripts cần server và Supabase, có tạo tài khoản/dữ liệu tạm rồi dọn. Chạy trên môi trường test riêng, không chạy tùy tiện trên database CLB.

```powershell
$env:TEST_BASE_URL='http://localhost:3000'
npm run check:website
npm run check:uploads
```

## Deploy và tài liệu

`vercel.json`, `.vercelignore`, template env đã được chuẩn bị. Root Directory trên Vercel là **gốc repository**, không chọn `src`. Đặt ba biến môi trường cho Production/Preview trước deploy. Vercel + Supabase đủ cho dùng thử; Render không bắt buộc, Cloudflare có thể bổ sung cho DNS/tên miền.

- [Kiến trúc FE/BE](docs/ARCHITECTURE.md)
- [Deploy Vercel và duy trì local](docs/DEPLOYMENT.md)
- [Hướng dẫn CLB dùng thử](docs/CLUB-TRIAL.md)
- [Backend](docs/BACKEND.md), [Supabase](docs/SUPABASE.md)
- [Nghiệp vụ](docs/BUSINESS-REQUIREMENTS.md), [thiết kế](docs/DESIGN.md)
- [Tài nguyên cây](docs/TREE-ART.md), [tham chiếu](docs/REFERENCES.md)

Chỉ gửi CLB URL sau khi Vercel báo Ready và đã kiểm tra trên URL thực tế. Gửi tài khoản admin qua kênh riêng; tài liệu không chứa mật khẩu.
