# Vầng Trăng Hòa Sắc 2 — thiết kế frontend
Giữ thương hiệu tím, vàng và ấn phẩm gốc. Đối tượng: tình nguyện viên, khách đọc tin, quản trị viên. Ưu tiên điện thoại.
## Hệ thống
Atmospheric, nhiều màu sắc theo yêu cầu người dùng: giữ hero cũ, ảnh nền chương trình xuyên suốt web, tiêu đề vàng và sắc tím. Trang chủ Photographic + Catalogue; quản trị Workbench; tin tức Long Document. Lora cho tiêu đề nội dung, Be Vietnam Pro cho UI và hero. Khu vực công khai dùng nền tím trong suốt trên background gốc; quản trị dùng nền kem để thao tác rõ ràng. Token trong src/frontend/styles/site.css. Khoảng cách thang 4px, tôn trọng reduced-motion. Hero căn giữa và tiêu đề màu theo thiết kế cũ là lựa chọn người dùng yêu cầu giữ.
Nút tối thiểu 44px. Badge có chữ. Ô nhập có focus ring. Card một lớp. Dòng danh sách có hành động riêng. Dialog native, Escape, nút đóng. Trạng thái rỗng và lỗi có hướng dẫn.
## Ảnh
Khu vực BTC, cố vấn và các ban là một slideshow ảnh toàn khung, đặt giữa màn hình. Dùng 8 ảnh 1536 × 1024 trong public/images/btc, theo thứ tự no1.png rồi 2.png đến 8.png. Không tách chân dung hoặc dựng lại nội dung nhân sự. Không tự chạy; điều khiển bằng nút, bàn phím hoặc vuốt. Liên kết đội ngũ trên trang chọn đúng nhóm ảnh; cấu hình bật/tắt khu vực vẫn quyết định nhóm ảnh được công khai.
Giữ file gốc, không re-encode. Thẻ và ảnh nhân sự dùng unoptimized, object-contain, không phủ màu. Ảnh không mở popup khi chạm; chỉ phản hồi hover/chạm nhẹ. Không lấy ảnh người khác làm fallback. CMS là nguồn chính, không phục hồi mẫu khi danh sách rỗng.
## Phạm vi
Chỉnh tại chỗ trang chủ, quản trị, bài viết, component. Có danh sách tin và ảnh theo tỷ lệ gốc. Giữ backend và cây kỷ niệm. Không xóa file sản xuất.

## Tương tác điện thoại và âm thanh
Các CTA công khai chỉ dùng chữ. Mobile có nút tối thiểu 44px, bộ lọc ban bằng select, tin tức vuốt ngang và phản hồi nhẹ khi chạm ảnh. Poster hỗ trợ vuốt; chú thích/chấm chọn ẩn trên điện thoại. Ảnh tin tức giữ tỷ lệ tự nhiên, không chèn viền đen.
Nút âm thanh ghi Bật tiếng / Tắt tiếng, chỉ phát sau thao tác người dùng và dừng khi vào admin hoặc ẩn tab. Mặc định dùng giai điệu chuông nguyên bản; thay một MP3 tại /admin/website/brand. MP3 luôn được phát lặp.


## Mobile và âm thanh
- Nút và liên kết công khai dùng chữ, không có icon hoặc mũi tên trang trí. Nút chuyển poster vẫn giữ để thao tác trên máy tính.
- Dưới 768 px: ẩn chú thích/chấm chọn poster và danh sách “Lời nhắn của chúng ta”. Giữ thao tác vuốt ảnh và đọc lời nhắn trực tiếp trên cây.
- Tên chương trình ở masthead dùng token vàng `--site-accent`.
- Thay nhạc tại `/admin/website/brand` → Nhạc nền → tải một MP3 → Lưu thay đổi. Chỉ một bài được chọn, giữ nguyên chất lượng, phát lặp khi khách chạm “Bật tiếng”.
- Tệp MP3 upload trực tiếp qua bucket staging riêng tư, kiểm tra MPEG frames và lưu ở `gallery/music/`. Cấu hình bài được chọn nằm trong `site_settings.content.musicTrack`, không cần thay schema của thư viện ảnh. Các bản upload trước vẫn lưu trong Storage, giúp giữ an toàn khi đang đổi bài.
- Chạy `node scripts/admin/enable-music.cjs` khi cấu hình Supabase mới để thêm MIME `audio/mpeg` vào hai bucket, giữ nguyên quyền truy cập và giới hạn dung lượng.

Nhạc nền hiển thị tên tệp ngay khi bắt đầu upload, trạng thái chưa lưu/đã lưu cạnh bài đã chọn, và lỗi tại ô upload. Sau khi lưu, admin đọc lại cấu hình từ server để xác nhận. MP3 có nhiều khối ID3 được hỗ trợ. Các nút “Xem trang web” mở tab mới, giữ màn quản trị.
