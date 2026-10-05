# YÊU CẦU NGHIỆP VỤ — VẦNG TRĂNG HÒA SẮC 2

Phiên bản: 1.0  
Ngày lập: 04/10/2026  
Mục đích: Chốt phạm vi nghiệp vụ để thiết kế và hoàn thiện backend, cơ sở dữ liệu và trang quản trị.

## 1. Mục tiêu dự án

Website lưu lại hành trình của chương trình Vầng Trăng Hòa Sắc 2, giới thiệu những người tham gia và tạo không gian để tình nguyện viên (TNV) gửi lời nhắn kỷ niệm.

Admin quản lý nội dung trang chủ, bài viết, ảnh và danh sách nhân sự qua trang quản trị, không phải sửa mã nguồn. TNV và khách truy cập xem nội dung đã đăng, đọc lời nhắn và gửi lời nhắn lên cây kỷ niệm.

Logo, background và màu sắc của chương trình được sử dụng thống nhất. Chức năng quản trị nội dung không bao gồm trình thiết kế giao diện kéo thả tự do.

## 2. Người dùng và quyền hạn

| Vai trò | Quyền hạn |
|---|---|
| Admin | Đăng nhập trang quản trị; quản lý nội dung landing page, bài viết, album ảnh, cố vấn, ban tổ chức, các ban, trưởng/phó ban và TNV. |
| TNV / khách truy cập | Xem nội dung công khai; lọc và đọc bộ sưu tập khoảnh khắc; xem nhân sự; gửi và đọc lời nhắn trên cây. Không cần tài khoản. |

Chỉ tài khoản được cấp quyền admin mới được quản trị. Không cung cấp chức năng đăng ký tài khoản admin công khai. TNV không có quyền tải ảnh, tạo bài viết hay chỉnh sửa danh sách nhân sự.

Vì gửi lời nhắn không yêu cầu đăng nhập, tên và ban/đội trong lời nhắn là thông tin do người gửi tự khai; hệ thống không xác thực danh tính hoặc bắt buộc người gửi phải có trong danh sách TNV.

## 3. Quản lý landing page

Hiểu yêu cầu “Admin có thể landing page” là admin có thể quản lý nội dung trang chủ trong các khu vực đã thiết kế.

Admin có thể:

- Cập nhật tên chương trình, tiêu đề, mô tả, lời giới thiệu và nội dung các nút điều hướng.
- Gán hoặc thay ảnh logo, background và ảnh dùng trong các khu vực nội dung.
- Chỉnh nội dung recap, các số liệu chương trình và các mốc hành trình nếu khu vực đó được sử dụng.
- Cập nhật tiêu đề và mô tả cho các khu vực cố vấn, ban tổ chức, trưởng/phó ban, TNV, bộ sưu tập và cây kỷ niệm.
- Bật/tắt khu vực nội dung và thay đổi thứ tự hiển thị trong phạm vi bố cục hỗ trợ.
- Lưu thay đổi và xem kết quả trên trang công khai sau khi cập nhật thành công.

Các danh sách nhân sự và bài viết hiển thị trên landing page lấy từ dữ liệu quản trị tương ứng, không nhập lại thành những bản sao độc lập.

## 4. Bộ sưu tập khoảnh khắc — bài viết và album ảnh

Khu vực “Bộ sưu tập khoảnh khắc” trong ảnh tham chiếu là danh sách các bài viết về hoạt động. Mỗi bài có nội dung giới thiệu và một hoặc nhiều ảnh; không chỉ là một ảnh rời.

### 4.1. Quản trị bài viết

Admin có thể tạo, sửa, đăng, gỡ đăng và xóa bài viết. Một bài gồm:

| Trường | Quy tắc |
|---|---|
| Tiêu đề | Bắt buộc. |
| Đường dẫn bài viết | Duy nhất, có thể sinh từ tiêu đề; đổi tiêu đề không tự làm hỏng đường dẫn đã đăng. |
| Mô tả ngắn | Dùng trên thẻ bài viết của bộ sưu tập. |
| Nội dung | Nội dung đầy đủ của hoạt động; hỗ trợ đoạn văn, tiêu đề, danh sách và ảnh. |
| Danh mục | Chọn từ danh mục bộ sưu tập. |
| Ảnh bìa | Bắt buộc khi đăng bài. |
| Album ảnh | Một hoặc nhiều ảnh, có chú thích và thứ tự hiển thị. |
| Trạng thái | Nháp hoặc đã đăng. |
| Thứ tự hiển thị | Admin có thể sắp xếp các bài. |
| Thời gian | Ghi nhận thời điểm tạo, cập nhật và đăng bài. |

Bài nháp và bài đã gỡ đăng chỉ admin xem được. Bài đã đăng xuất hiện trong bộ sưu tập và có trang chi tiết. Khi xóa bài, hệ thống không được xóa nhầm ảnh đang được dùng ở bài hoặc khu vực khác.

### 4.2. Danh mục và trải nghiệm xem

Danh mục khởi tạo theo giao diện: **Chuẩn bị, Đêm hội, Trao quà, Khoảnh khắc**. Admin có thể quản lý tên và thứ tự danh mục. “Tất cả” là lựa chọn xem toàn bộ bài đã đăng, không phải một danh mục để gán cho bài.

Người xem có thể lọc theo danh mục, mở chi tiết bài, đọc nội dung và xem album ảnh. Danh sách có phân trang hoặc tải thêm khi số bài tăng. Không hiển thị bài nháp qua danh sách hoặc truy cập đường dẫn trực tiếp.

## 5. Quản lý ảnh

Chỉ admin được upload và quản lý ảnh. Admin có thể tải ảnh lên, xem ảnh đã tải và gán ảnh cho:

- Landing page và nhận diện chương trình.
- Ảnh bìa, ảnh trong nội dung và album bài viết.
- Cố vấn, ban tổ chức, trưởng/phó ban và TNV.

Một ảnh có thể được sử dụng ở nhiều vị trí. Hệ thống lưu thông tin tệp, mô tả ảnh và nơi ảnh đang được sử dụng. Khi xóa ảnh còn được tham chiếu, hệ thống yêu cầu thay/gỡ các liên kết trước hoặc từ chối thao tác và chỉ rõ vị trí đang dùng.

Ảnh upload phải là định dạng được cho phép và nằm trong giới hạn dung lượng. Thiết lập ban đầu: JPEG, PNG, WebP; tối đa 10 MB/tệp. Ảnh đã dùng trên trang công khai có thể được truy cập để hiển thị.

## 6. Quản lý nhân sự và các ban

### 6.1. Danh sách cố vấn

Admin thêm, sửa, gỡ khỏi hiển thị hoặc xóa cố vấn; cập nhật họ tên, chức danh/vai trò, đơn vị, ảnh chân dung, lời nhắn trích dẫn nếu có và thứ tự hiển thị.

### 6.2. Ban tổ chức

Landing page hiện có khu vực Ban tổ chức. Admin quản lý họ tên, chức vụ, nội dung phụ trách, ảnh, lời nhắn nếu có và thứ tự hiển thị của các thành viên trong khu vực này.

### 6.3. Các ban và trưởng/phó ban

Admin tạo và cập nhật các ban, tùy chỉnh tên ban, mã ban nếu sử dụng, mô tả và thứ tự hiển thị. Không cố định tên hoặc số lượng ban trong mã nguồn.

Admin gán nhân sự làm trưởng ban hoặc phó ban; cập nhật họ tên, ảnh và vai trò. Một ban có thể có nhiều phó ban. Không bắt buộc tất cả các ban phải có đủ trưởng/phó mới được lưu.

Đổi tên ban phải cập nhật tên hiển thị ở mọi danh sách liên quan mà không mất liên kết nhân sự. Không xóa ban đang có nhân sự liên kết trước khi chuyển hoặc gỡ các liên kết đó.

### 6.4. Danh sách tình nguyện viên

Admin thêm, sửa, gỡ khỏi hiển thị hoặc xóa TNV; quản lý họ tên, mã TNV nếu có, ban/đội, ảnh chân dung, lời giới thiệu/trích dẫn, nhãn ghi nhận nếu có và thứ tự hiển thị.

Danh sách công khai cho phép xem TNV theo ban/đội. TNV không tự sửa hồ sơ hoặc tự upload ảnh. Ảnh và thông tin hiển thị do admin chọn.

Một người có thể có nhiều vai trò trong chương trình. Khi thiết kế DB, cần giữ được liên kết giữa người, ban và vai trò để tránh phải tạo các hồ sơ mâu thuẫn.

## 7. Cây kỷ niệm

### 7.1. Gửi lời nhắn

TNV hoặc khách có link có thể gửi lời nhắn tùy ý mà **không đăng nhập và không kiểm duyệt trước**. Không giới hạn mỗi người chỉ được gửi một lần.

Form gồm:

| Trường | Quy tắc |
|---|---|
| Tên người gửi | Bắt buộc, 1–80 ký tự sau khi bỏ khoảng trắng thừa ở đầu/cuối. |
| Ban / Đội | Không bắt buộc, tối đa 80 ký tự; là thông tin tự khai. |
| Lời nhắn | Bắt buộc, 1–1.000 ký tự sau khi bỏ khoảng trắng ở đầu/cuối. |
| Biểu tượng | Chọn lồng đèn hoặc ngôi sao. |

Form không có upload ảnh, avatar hoặc tệp. Kiểm tra dữ liệu hợp lệ không phải kiểm duyệt nội dung.

### 7.2. Lưu và hiển thị

- Mỗi lời nhắn lưu thành công tương ứng đúng một lồng đèn hoặc ngôi sao trên cây.
- Hiển thị ngay sau khi lưu, không có trạng thái chờ duyệt.
- Người đang mở trang nhận lời nhắn mới qua realtime.
- Khi tải lại trang, lời nhắn đã lưu vẫn còn; khi mất kết nối rồi kết nối lại, dữ liệu được đồng bộ lại.
- Mỗi lời nhắn có ID, thời điểm gửi và vị trí do hệ thống cấp. Người gửi không được tự chỉ định các giá trị này.
- Nhấn vào biểu tượng để đọc tên, ban/đội, nội dung và ngày gửi.
- Khi số lời nhắn vượt sức chứa một tán cây, hệ thống chia nhiều tán/trang; không bỏ lời nhắn cũ hoặc cho các biểu tượng ghi đè lên nhau.
- Người gửi không được sửa/xóa lời nhắn qua giao diện công khai. Danh sách lời nhắn cũng có thể đọc ngoài cây để dễ sử dụng.

Lá cây là thành phần trang trí chuyển động; không đại diện cho lời nhắn mới. Lời nhắn kiểu lá đã có trước đây được giữ dữ liệu và hiển thị thành lồng đèn để tương thích.

## 8. Quy tắc dữ liệu và quyền truy cập

- Chỉ admin được thay đổi landing page, bài viết, ảnh và nhân sự. Chặn truy cập trái quyền ở backend/DB, không chỉ ẩn nút trên giao diện.
- Nội dung đã đăng hoặc bật hiển thị được đọc công khai; bản nháp và dữ liệu quản trị không được đọc công khai.
- Các liên kết bài viết–ảnh, người–ban–vai trò phải có quy tắc nhất quán khi thêm, sửa hoặc xóa.
- Nội dung văn bản được hiển thị an toàn, không thực thi mã do người nhập đưa vào.
- Lỗi lưu phải được báo rõ; chỉ báo thành công khi dữ liệu thực sự được lưu. Form giữ nội dung khi gửi thất bại.
- Bí mật truy cập hệ thống không được trả về trình duyệt.

Không có đăng nhập TNV đồng nghĩa với việc website không xác minh thành viên hoặc hạn chế người ngoài gửi lời nhắn chỉ bằng danh sách TNV.

## 9. Phạm vi backend và cơ sở dữ liệu cần hoàn thiện

| Nhóm nghiệp vụ | Backend / dữ liệu cần có |
|---|---|
| Admin | Đăng nhập, phiên đăng nhập, kiểm tra quyền admin cho từng thao tác. |
| Landing page | Đọc nội dung công khai; cập nhật cấu hình, khu vực, số liệu và hành trình bằng quyền admin. |
| Bài viết | Quản lý nháp/đăng/gỡ đăng; danh sách công khai; chi tiết theo đường dẫn; lọc, phân trang. |
| Danh mục | Quản lý danh mục và thứ tự; bảo vệ liên kết với bài viết. |
| Ảnh | Upload bằng quyền admin; thư viện ảnh; gán/thay/gỡ ảnh; xử lý ảnh còn được dùng. |
| Nhân sự | Quản lý hồ sơ, cố vấn, ban tổ chức, các ban, vai trò trưởng/phó ban và TNV. |
| Cây kỷ niệm | Gửi công khai; kiểm tra dữ liệu; lưu và cấp vị trí; đọc phân trang; realtime. |

Các nhóm dữ liệu tối thiểu gồm: quyền admin, cấu hình trang, khu vực landing page, hồ sơ nhân sự, ban/đội, phân công vai trò, danh mục bài viết, bài viết, tài sản ảnh, liên kết ảnh với nội dung và lời nhắn kỷ niệm. Đây là mô hình nghiệp vụ; tên bảng cụ thể sẽ được chốt trong thiết kế DB.

Backend hiện có API lời nhắn, API gallery ảnh rời và DB tương ứng. **Chưa thể xem là hoàn thiện backend toàn dự án** khi chưa có quản trị landing page, bài viết/album, ảnh, nhân sự và phân quyền admin. Gallery ảnh rời cần được mở rộng theo mô hình bài viết có album trong tài liệu này.

## 10. Tiêu chí nghiệm thu

1. Admin đăng nhập và quản lý nội dung qua trang quản trị; khách không thể gọi API để làm các thao tác admin.
2. Admin sửa nội dung/ảnh landing page và kết quả hiển thị đúng trên trang chủ.
3. Admin tạo bài nháp có album; bài chưa xuất hiện công khai. Sau khi đăng, bài xuất hiện đúng danh mục và mở được trang chi tiết. Gỡ đăng thì bài không còn truy cập công khai.
4. Admin sắp xếp ảnh, thay ảnh bìa và cập nhật chú thích; kết quả hiển thị đúng. Xóa ảnh dùng chung không làm hỏng nội dung khác.
5. Admin cập nhật cố vấn, ban tổ chức, trưởng/phó ban và TNV; các khu vực công khai lấy đúng dữ liệu đã cập nhật.
6. Đổi tên ban cập nhật các nơi liên quan và giữ nguyên thành viên. Xóa ban còn được sử dụng bị chặn hoặc có quy trình xử lý liên kết rõ ràng.
7. Người không đăng nhập gửi lời nhắn hợp lệ; biểu tượng xuất hiện ngay, cửa sổ thứ hai nhận qua realtime và tải lại vẫn thấy.
8. Gửi nhiều lời nhắn đồng thời không trùng vị trí; khi vượt một tán cây vẫn đọc được tất cả lời nhắn.
9. Dữ liệu sai bị từ chối; người dùng công khai không thể upload ảnh, đăng bài, sửa nhân sự hoặc sửa/xóa lời nhắn.

## 11. Ngoài phạm vi hiện tại

- Tài khoản, hồ sơ tự quản lý hoặc xác thực danh tính TNV.
- Upload ảnh/file từ TNV.
- Duyệt lời nhắn trước khi hiển thị.
- Bình luận hoặc thả cảm xúc trên bài viết.
- Đăng ký tham gia chương trình, điểm danh, quản lý công việc hoặc quyên góp/thanh toán.
- Trình dựng landing page tự do và quản lý nhiều mùa chương trình.

Chức năng admin ẩn/xóa lời nhắn sau khi đăng, nhập nhân sự hàng loạt, lịch đăng bài và phân cấp nhiều loại admin chưa nằm trong phạm vi đã chốt; bổ sung khi có yêu cầu riêng.
