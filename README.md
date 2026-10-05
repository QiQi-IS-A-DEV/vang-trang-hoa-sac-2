# Vầng Trăng Hòa Sắc 2

Website chương trình Trung Thu Tình Nguyện **Vầng Trăng Hòa Sắc 2**, nơi giới thiệu chương trình, lưu giữ hoạt động và kết nối tình nguyện viên qua cây kỷ niệm.

## Tính năng

- Trang chủ với thông tin chương trình, slideshow các ban và thẻ tình nguyện viên có tìm kiếm.
- Cây kỷ niệm tương tác: gửi lời nhắn bằng đèn lồng hoặc ngôi sao, cập nhật realtime.
- Bài viết theo danh mục, trang chi tiết và album ảnh.
- CMS quản lý nội dung website, nhân sự, ban, thẻ tình nguyện viên, bài viết và thư viện ảnh.
- Đăng nhập quản trị bằng Supabase Auth, phân quyền dữ liệu bằng PostgreSQL RLS.

## Công nghệ

Next.js 16.3 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion và Supabase (PostgreSQL, Auth, Storage, Realtime).

## Chạy tại máy

Yêu cầu **Node.js 20.9 trở lên**, npm và project Supabase đã cấu hình database.

```powershell
git clone https://github.com/QiQi-IS-A-DEV/vang-trang-hoa-sac-2.git
cd vang-trang-hoa-sac-2
npm ci
Copy-Item .env.local.example .env.local
```

Điền các biến trong `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_SECRET_KEY=your-supabase-server-secret
```

Secret chỉ dùng phía server. Không commit file môi trường hoặc mật khẩu quản trị.

Với **project Supabase mới**, áp dụng migration trong `supabase/migrations/` theo thứ tự tên tăng dần. Xem [hướng dẫn backend](docs/BACKEND.md) để cấu hình Storage, Realtime và quyền truy cập. Với database đang vận hành, kiểm tra lịch sử migration trước khi áp dụng; không chạy lại migration đã có.

Có thể nhập dữ liệu ban đầu và tạo quản trị viên:

```powershell
npm run import:cms
node scripts/create-admin.cjs your@email.com
```

Dữ liệu import có thông tin mẫu, cần rà soát và thay bằng nội dung thực tế. Script tạo admin yêu cầu nhập mật khẩu trong terminal.

```powershell
npm run dev
```

Mở [localhost:3000](http://localhost:3000).

## Các trang chính

| Đường dẫn | Nội dung |
| --- | --- |
| `/` | Trang chủ chương trình |
| `/memories` | Cây kỷ niệm và lời nhắn |
| `/posts` | Danh sách bài viết |
| `/posts/<slug>` | Chi tiết bài viết và album |
| `/admin` | Đăng nhập và quản trị |

## Lệnh thường dùng

| Lệnh | Chức năng |
| --- | --- |
| `npm run dev` | Chạy môi trường phát triển |
| `npm run build` | Build production |
| `npm start` | Chạy bản production đã build |
| `npm run lint` | Kiểm tra ESLint |
| `npm run import:cms` | Nhập dữ liệu ban đầu vào CMS |
| `npm run check:cms` | Kiểm tra tích hợp CMS |
| `npm run check:backend` | Kiểm tra tích hợp backend và lời nhắn |

Các kiểm tra tích hợp yêu cầu server đang chạy và cấu hình Supabase hợp lệ; chúng tạo và dọn dữ liệu kiểm thử. Chạy trên môi trường kiểm thử riêng:

```powershell
$env:TEST_BASE_URL='http://localhost:3000'
npm run check:cms
npm run check:backend
```

## Cấu trúc dự án

```text
app/                  Trang, layout và API Route Handlers
components/           Giao diện trang chủ, cây kỷ niệm và quản trị
data/                 Dữ liệu ban đầu, cấu hình ảnh và vị trí trên cây
lib/                  Supabase, CMS, validation và hooks
public/               Ảnh, âm thanh và tài nguyên tĩnh
scripts/              Nhập dữ liệu, tạo admin và kiểm tra tích hợp
supabase/migrations/  Schema, RLS và các cập nhật database
types/                Kiểu dữ liệu TypeScript
docs/                 Tài liệu nghiệp vụ và vận hành
```

## Triển khai

Dùng nền tảng hỗ trợ Next.js với Node.js runtime. Cấu hình ba biến môi trường ở trên, chuẩn bị database Supabase rồi chạy `npm ci`, `npm run build` và `npm start`. Build cần truy cập Google Fonts vì dự án sử dụng `next/font/google`.

## Tài liệu

- [Backend và vận hành](docs/BACKEND.md)
- [Thiết lập Supabase](docs/SUPABASE.md)
- [Yêu cầu nghiệp vụ](docs/BUSINESS-REQUIREMENTS.md)
- [Hệ thống thiết kế](design.md)
- [Tài nguyên cây kỷ niệm](docs/TREE-ART.md)
- [Tham chiếu thiết kế](docs/REFERENCES.md)
