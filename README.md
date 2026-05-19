# Hướng Dẫn Sử Dụng: GitHub Comment Template Extension

Extension này giúp bạn lưu trữ và chèn nhanh các mẫu comment đã soạn sẵn khi review Pull Request trên GitHub. Danh sách các mẫu comment sẽ được tự động phân tách riêng theo từng repository.

---

## Các tính năng chính

### 1. Tự động mở Side Panel
- Khi bạn click vào tab **"Files changed"** của Pull Request trên GitHub, tiện ích sẽ tự động mở Side Panel ở cạnh phải màn hình.

### 2. Phân chia mẫu comment theo Repository
- Mỗi repository sẽ có một danh sách mẫu comment riêng, không bị hiển thị lẫn lộn sang repository khác.
- Khi bạn chuyển tab trình duyệt hoặc đổi repository, danh sách comment trên Side Panel cũng sẽ tự động chuyển đổi theo dự án tương ứng.
- Khi lướt các trang web không phải repository GitHub, bộ công cụ tạo mẫu comment sẽ tự động ẩn đi.

### 3. Chèn comment bằng 1-click
- Click chuột vào mẫu comment bất kỳ trong danh sách để tự động chèn nội dung vào ô viết nhận xét trên GitHub.
- Tiện ích tự động xuống dòng nếu ô viết nhận xét đã có sẵn chữ, đồng thời đồng bộ trạng thái để kích hoạt các nút bấm của GitHub ngay lập tức.

### 4. Quản lý comment (Thêm, Sửa, Xóa)
- **Thêm mẫu mới:** Click nút **"Thêm Mẫu Nhận Xét"** để mở form nhập liệu. Bạn có thể đặt tên, nhập nội dung mẫu và chọn màu sắc nhận diện.
- **Sửa mẫu:** Click vào biểu tượng Bút chì (`✏️`) trên card để nạp dữ liệu cũ lên form và cập nhật.
- **Xóa mẫu:** Click vào biểu tượng Thùng rác (`🗑️`) để xóa mẫu khỏi danh sách.

### 5. Sắp xếp theo tên (A-Z)
- Danh sách comment tự động được sắp xếp theo thứ tự bảng chữ cái A-Z (hỗ trợ tiếng Việt và emojis).

### 6. Import và Export file JSON
- **Export:** Tải danh sách comment của repository hiện tại về máy tính dưới dạng file JSON.
- **Import:** Chọn file JSON từ máy tính để nạp vào repository hiện tại. Nếu trùng tên với comment cũ sẽ tự động ghi đè, nếu tên mới sẽ thêm vào danh sách.

---

## Hướng dẫn cài đặt

1. Truy cập địa chỉ `chrome://extensions/` trên Google Chrome.
2. Bật công tắc **"Developer mode"** (Chế độ dành cho nhà phát triển) ở góc trên cùng bên phải.
3. Click vào nút **"Load unpacked"** (Tải tiện ích đã giải nén) ở góc trên bên trái.
4. Chọn thư mục chứa extension này trên máy tính của bạn:
   `/Users/trungnguyen/iCloud Drive (Archive)/Documents/DocumentsTrungNguyen/Github/chromex-github-comment`
5. Ghim extension lên thanh công cụ của trình duyệt để dễ dàng theo dõi.
