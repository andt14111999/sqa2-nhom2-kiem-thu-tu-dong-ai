# Lời nhắc dùng trong thí nghiệm AI sinh test

Mỗi nhóm chạy 3 phiên độc lập với cùng một lời nhắc, không có ngữ cảnh nào khác.
Mỗi phiên được yêu cầu không đọc file và không chạy lệnh, nên mô hình chỉ thấy nội dung trong lời nhắc và không biết kết quả chạy test của chính mình.
File `test/ai_*.test.mjs` là đầu ra nguyên bản, chưa sửa.

## Lời nhắc chung

> Viết bộ kiểm thử tự động cho hàm JavaScript theo đặc tả dưới đây, dùng node:test và node:assert/strict, import hàm bằng `import { tinhDiemHocPhan } from "../src/diem.js";`.

Nhóm "chỉ mã nguồn" thay "hàm JavaScript theo đặc tả" bằng "module JavaScript", và thay đặc tả bằng mã nguồn.

## Nhóm "đặc tả đầy đủ" (`ai_day_du_*`)

Phần "Quy tắc" của [DacTa.md](DacTa.md), nguyên văn.

## Nhóm "đặc tả thiếu" (`ai_thieu_*`)

Giống nhóm trên nhưng bỏ câu cuối của quy tắc 3: "Kết quả tròn phải đúng theo số học thập phân, không bị sai do biểu diễn số thực nhị phân."

## Nhóm "chỉ mã nguồn" (`ai_ma_nguon_*`)

Toàn bộ nội dung [lichsu/diem_loi_lamtron.js](lichsu/diem_loi_lamtron.js), không có đặc tả.
Mã này có lỗi làm tròn D1 nhưng đã sửa lỗi kiểm tra đầu vào D2.
