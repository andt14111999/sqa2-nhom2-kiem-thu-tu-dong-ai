# Đặc tả chương trình demo: tính điểm học phần

Đặc tả này dùng cho phần thực nghiệm của báo cáo, không phải quy chế chính thức của Học viện.

## Hàm

`tinhDiemHocPhan({ chuyenCan, baiTap, kiemTra, thi })` trong `src/diem.js`, xuất theo chuẩn ES module.
Trả về đối tượng `{ tongKet, diemChu, trangThai }`.

## Quy tắc

1. Mỗi điểm thành phần phải có kiểu number, hữu hạn, nằm trong đoạn [0; 10] và có tối đa 1 chữ số thập phân.
   Nếu không, hàm ném `RangeError` với thuộc tính `code` là `DIEM_KHONG_HOP_LE` và thuộc tính `truong` là tên trường sai đầu tiên, xét theo thứ tự chuyenCan, baiTap, kiemTra, thi.
2. Nếu `chuyenCan` nhỏ hơn 5 thì sinh viên bị cấm thi: `tongKet` là 0, `diemChu` là `F`, `trangThai` là `CAM_THI`.
3. Trong các trường hợp còn lại, `tongKet` = 0,1 x chuyenCan + 0,2 x baiTap + 0,2 x kiemTra + 0,5 x thi, làm tròn đến 1 chữ số thập phân theo quy tắc làm tròn nửa lên (ví dụ 7,25 thành 7,3; 7,24 thành 7,2). Kết quả tròn phải đúng theo số học thập phân, không bị sai do biểu diễn số thực nhị phân.
4. Nếu `thi` nhỏ hơn 3 thì `diemChu` là `F` và `trangThai` là `KHONG_DAT`, dù `tongKet` bao nhiêu (`tongKet` vẫn tính theo quy tắc 3).
5. Trong các trường hợp còn lại, `diemChu` lấy theo `tongKet` đã làm tròn:

| tongKet | diemChu |
| --- | --- |
| từ 9,0 đến 10,0 | A+ |
| từ 8,5 đến 8,9 | A |
| từ 8,0 đến 8,4 | B+ |
| từ 7,0 đến 7,9 | B |
| từ 6,5 đến 6,9 | C+ |
| từ 5,5 đến 6,4 | C |
| từ 5,0 đến 5,4 | D+ |
| từ 4,0 đến 4,9 | D |
| dưới 4,0 | F |

6. `trangThai` là `DAT` nếu `diemChu` khác `F`, ngược lại là `KHONG_DAT`.

## Giao diện web

Trang `web/index.html` có 4 ô nhập với nhãn "Chuyên cần", "Bài tập", "Kiểm tra", "Thi" và nút "Tính điểm".
Khi hợp lệ, trang hiện kết quả trong vùng `role="status"` theo mẫu `Tổng kết: 7.3 - Điểm chữ: B - Trạng thái: DAT`.
Khi không hợp lệ, trang hiện thông báo trong vùng `role="alert"` theo mẫu `Điểm không hợp lệ: <tên trường>` và không hiện kết quả.
