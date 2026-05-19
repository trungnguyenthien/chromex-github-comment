# GitHub PR Review Assistant 🚀 ✨

**GitHub PR Review Assistant** là một Chrome Extension (Manifest V3) cao cấp được thiết kế riêng hoạt động trên tab **"Files changed"** của trang GitHub Pull Request. 

Extension này tự động tối ưu hóa quy trình làm việc bằng cách hiển thị **Side Panel** thông minh với lời chào thân thiện **"XIN CHÀO"** và cung cấp các công cụ phân tích code hữu ích ngay lập tức khi bạn bắt đầu review thay đổi.

---

## ✨ Tính Năng Nổi Bật

1. **Tự Động Kích Hoạt Side Panel (Auto-Open):**
   - Khi bạn click chuyển sang tab **"Files changed"** trên GitHub, extension sẽ bắt sự kiện click (user gesture) và lập tức mở Side Panel.
   - Nếu bạn truy cập trực tiếp bằng đường dẫn URL (F5/Bookmark), extension sẽ đăng ký một sự kiện tương tác một lần. Ngay khi bạn click/phím nhấn bất kỳ đâu để đọc code, Side Panel sẽ tự động bật lên.
2. **Dashboard In-Page Tích Hợp (Floating Badge):**
   - Một widget bong bóng tròn glassmorphic tuyệt đẹp, phát sáng huyền ảo xuất hiện ở góc dưới bên phải màn hình khi bạn ở tab **"Files changed"**, giúp bạn mở Side Panel chỉ bằng 1-click.
3. **Phân Tích PR Thời Gian Thực (Real-time Meta-data):**
   - Nhận diện Repository đang xem, số Pull Request, thông tin nhánh (`head` ← `base`) trực tiếp thông qua Chrome Scripting API.
4. **Bộ Công Cụ Review Tiêu Chuẩn:**
   - **Tóm tắt thay đổi:** Báo cáo nhanh các file đã được sửa đổi và mục đích chỉnh sửa.
   - **Kiểm tra Convention:** Rà soát chuẩn viết code (JavaScript, CSS).
   - **Phân tích bảo mật:** Quét nhanh tránh rò rỉ API Keys hay Secret Tokens.
   - **Nhận xét nhanh:** Các mẫu comment chuẩn hóa (LGTM, Suggestion) có thể sao chép nhanh vào clipboard chỉ với 1-click.

---

## 🛠️ Cấu Trúc Thư Mục Dự Án

```bash
chromex-github-comment/
├── manifest.json         # Cấu hình Chrome Extension MV3
├── background.js          # Service worker quản lý Side Panel
├── content.js             # Content Script theo dõi SPA navigation & inject floating badge
├── sidepanel.html         # Khung giao diện Side Panel
├── sidepanel.css          # CSS thiết kế Glassmorphism & Cyber gradient sang trọng
├── sidepanel.js           # Điều phối tương tác và xử lý dữ liệu Pull Request
└── icons/                 # Bộ icon chất lượng cao
    ├── logo.png
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🚀 Hướng Dẫn Cài Đặt (Developer Mode)

Hãy làm theo các bước sau để cài đặt extension vào trình duyệt Chrome của bạn:

1. **Mở trình quản lý Extension:**
   - Truy cập địa chỉ `chrome://extensions/` trên Google Chrome.
2. **Kích hoạt Chế độ nhà phát triển:**
   - Bật công tắc **"Developer mode"** (Chế độ dành cho nhà phát triển) ở góc trên cùng bên phải.
3. **Tải thư mục extension:**
   - Click vào nút **"Load unpacked"** (Tải tiện ích đã giải nén) ở góc trên bên trái.
   - Chọn thư mục dự án này:
     `/Users/trungnguyen/iCloud Drive (Archive)/Documents/DocumentsTrungNguyen/Github/chromex-github-comment`
4. **Ghim Extension (Khuyên dùng):**
   - Click vào biểu tượng mảnh ghép (Extensions) trên thanh công cụ của Chrome và ghim **GitHub PR Review Assistant** để dễ dàng truy cập.

---

## 💡 Cách Hoạt Động & Cơ Chế "User Gesture"

Trong Chrome MV3, API `chrome.sidePanel.open()` có tính bảo mật cực kỳ cao và **bắt buộc phải có tương tác của người dùng** (User Gesture - ví dụ: click chuột, gõ phím) mới có thể hoạt động. Để đảm bảo trải nghiệm tự động mượt mà nhất mà vẫn tuân thủ cơ chế bảo mật này, extension áp dụng thiết kế thông minh:

- **Khi chuyển tab trên GitHub:** Thao tác click chuột của bạn vào tab **"Files changed"** chính là một *User Gesture*. Content Script nhận biết và lập tức chuyển tiếp cử chỉ này đến Service Worker để kích hoạt Side Panel ngay lập tức.
- **Khi tải trực tiếp link Files changed:** Chrome ban đầu sẽ chặn lệnh tự động mở. Do đó, extension lắng nghe sự kiện tương tác đầu tiên của bạn trên trang (click xem dòng code, scroll nhẹ, nhấn nút). Ngay lập tức, Side Panel sẽ tự bật lên mà bạn không cần bấm thêm bất cứ nút nào bên ngoài.
- **Floating Badge:** Bong bóng trợ lý ảo ở góc màn hình là điểm chạm hoàn hảo, vừa tăng tính chuyên nghiệp vừa cung cấp 1-click mở panel 100% thành công.

---

## 🎨 Thiết Kế Giao Diện
- **Chủ đề màu sắc:** Không gian vũ trụ huyền ảo (Deep Space Core) pha trộn dải màu Cyber Violet (`#8B5CF6`) và Electric Indigo (`#3B82F6`).
- **Hiệu ứng Glassmorphic:** Sử dụng lớp phủ kính mờ `backdrop-filter: blur(12px)` kết hợp viền bán trong suốt để hòa hợp hoàn hảo với giao diện sáng/tối của GitHub.
- **Chuyển động mượt mà:** Hiệu ứng hover co giãn nhẹ, chuyển động xoay tinh tế của Sparkle icon và hiệu ứng trượt nhẹ (`slide-up`) tạo cảm giác hiện đại và đắt giá.
