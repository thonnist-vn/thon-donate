# THÒN NIST DONATE

Website tĩnh: HTML + CSS + JavaScript thuần, không cần build, không cần cài ứng dụng.

## Cấu trúc
- `index.html`, `style.css`, `script.js`: trang công khai
- `admin.html`, `admin.js`: khu vực quản trị
- `data.js`: cấu hình + danh sách giao dịch đã xác minh (file duy nhất cần cập nhật)
- `assets/zalopay-qr.jpg`: ảnh QR ZaloPay

## Thay thông tin DONATE thật
Cách 1 (khuyên dùng): mở `admin.html` → tạo mật khẩu → sửa → Lưu cấu hình → "Tải data.js" → thay file `data.js` trong dự án.
Cách 2: sửa trực tiếp `data.js` (mb.account, mb.name, zalo.qr, zalo.phone).
Thông tin MB đang điền sẵn theo ảnh QR bạn gửi; hãy kiểm tra lại.
Ảnh QR ZaloPay khác: chép vào `assets/` rồi sửa đường dẫn trong admin.

## Quy trình xác minh
1. Khách nhập tên, số tiền, bấm DONATE → khung thanh toán mở, có mã dạng `THONXXXXXX`.
2. Khách chuyển khoản và gửi tên/lời nhắn cho bạn (nút sao chép + đường dẫn liên hệ trong admin).
3. Bạn thấy tiền vào MB/ZaloPay → vào admin → "Thêm giao dịch" (nhập đúng mã) → Tải data.js → đưa lên.
4. Trang hiển thị DONATE; thiết bị của khách có mã khớp sẽ hiện lời cảm ơn.

## Triển khai
GitHub Pages: tạo repository → Add file → Upload files (giải nén zip, tải toàn bộ file và thư mục assets) → Settings → Pages → Branch `main` / root → Save.
Vercel: Add New → Project → chọn repository → Framework "Other", không có build command → Deploy.
Cập nhật data.js: upload đè lên file cũ, chờ 1–2 phút.

## Giới hạn cần biết
- Không có backend nên không thể tự xác minh giao dịch ngân hàng. Chỉ bạn xác minh thủ công.
- Mật khẩu admin (băm PBKDF2) và bản nháp lưu trên thiết bị của bạn. Nó khóa giao diện quản trị trên thiết bị đó, không đồng bộ giữa các máy. Quên mật khẩu: xóa dữ liệu trang web trong trình duyệt.
- Tên và lời nhắn khách nhập chỉ nằm trên thiết bị của họ cho đến khi họ gửi cho bạn.
- QR ZaloPay là QR tĩnh, không gắn sẵn số tiền. QR MB tạo bằng img.vietqr.io (cần mạng), có sẵn số tiền và nội dung.
- Tự động xác minh + đồng bộ nhiều người: cần backend (ví dụ Supabase + webhook SePay/Casso).
