# Vầng Trăng Hòa Sắc 2 — thiết kế frontend
Giữ thương hiệu tím, vàng và ấn phẩm gốc. Đối tượng: tình nguyện viên, khách đọc tin, quản trị viên. Ưu tiên điện thoại.
## Hệ thống
Atmospheric, nhiều màu sắc theo yêu cầu người dùng: giữ hero cũ, ảnh nền chương trình xuyên suốt web, tiêu đề vàng và sắc tím. Trang chủ Photographic + Catalogue; quản trị Workbench; tin tức Long Document. Lora cho tiêu đề nội dung, Be Vietnam Pro cho UI và hero. Khu vực công khai dùng nền tím trong suốt trên background gốc; quản trị dùng nền kem để thao tác rõ ràng. Token trong app/frontend.css. Khoảng cách thang 4px, tôn trọng reduced-motion. Hero căn giữa và tiêu đề màu theo thiết kế cũ là lựa chọn người dùng yêu cầu giữ.
Nút tối thiểu 44px. Badge có chữ. Ô nhập có focus ring. Card một lớp. Dòng danh sách có hành động riêng. Dialog native, Escape, nút đóng. Trạng thái rỗng và lỗi có hướng dẫn.
## Ảnh
Khu vực BTC, cố vấn và các ban là một slideshow ảnh toàn khung, đặt giữa màn hình. Dùng 8 ảnh 1536 × 1024 trong public/images/btc, theo thứ tự no1.png rồi 2.png đến 8.png. Không tách chân dung hoặc dựng lại nội dung nhân sự. Không tự chạy; điều khiển bằng nút, bàn phím hoặc vuốt. Liên kết đội ngũ trên trang chọn đúng nhóm ảnh; cấu hình bật/tắt khu vực vẫn quyết định nhóm ảnh được công khai.
Giữ file gốc, không re-encode. Thẻ và ảnh nhân sự dùng unoptimized, object-contain, không phủ màu. Xem, phóng và tải URL gốc. Không lấy ảnh người khác làm fallback. CMS là nguồn chính, không phục hồi mẫu khi danh sách rỗng.
## Phạm vi
Chỉnh tại chỗ trang chủ, quản trị, bài viết, component. Thêm danh sách tin và trình xem ảnh. Giữ backend và cây kỷ niệm. Không xóa file sản xuất.
