# Nghiên cứu tham khảo — 04.10.2026

## Repo đã xem

- https://github.com/carlosmarpaung08/wedding-invitation-app
  - Đã đọc src/components/WishesList.tsx: tải lời chúc, nghe INSERT và tháo channel khi unmount.
  - Học kiến trúc này; triển khai riêng client dùng chung, gộp theo ID và tải bù khi reconnect để hạn chế lời nhắn trùng/mất.
  - README ghi All rights reserved. Không sao chép mã hoặc hình ảnh từ repo.
- https://github.com/sharabasy/wedding-invitation-platform
  - README mô tả guestbook realtime, gallery và admin; kiểm tra cây thư mục có GuestBook và API quản lý messages.
  - Tham khảo việc tách ảnh do admin quản lý khỏi nội dung người gửi. Chưa audit toàn bộ mã nguồn.
- https://github.com/BABIN-JOE/BIRTHDAY-WISH
  - README có gallery, nội dung kỷ niệm và thông điệp; chỉ tham khảo cách chia khu vực, chưa đọc implementation.

Trong phạm vi tìm kiếm này chưa thấy repo cây lời nhắn có cùng stack và scope đủ sát để lấy làm nền. Phần dữ liệu gần nhất là guestbook realtime; cây sẽ xây riêng theo bộ nhận diện chương trình.

## Nguồn chính thức để kiểm tra triển khai

- https://supabase.com/docs/guides/realtime/postgres-changes
- https://supabase.com/docs/guides/database/postgres/row-level-security
- Next.js docs đi kèm phiên bản cài trong node_modules/next/dist/docs.
## Tham khảo cây Jurlique
https://www.adrenalin.co/work/bringing-sustainability-to-life-with-jurliques-digital-wishing-tree
Đã xem hình và video trong case study: cành phân nhánh, lá tách rời, lời nhắn treo trên cây và CTA dưới gốc. Phiên bản VTHS2 dùng cây vector được dựng riêng, tông tím/hồng/vàng, background chương trình và tương tác 2D phóng to/kéo/popup. Không dùng mô hình hoặc tài sản của Jurlique. Chưa triển khai cây WebGL xoay 360 độ.
