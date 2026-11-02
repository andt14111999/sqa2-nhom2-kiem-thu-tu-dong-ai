# Demo: kiểm thử tự động và AI sinh test

Chương trình thử và các bộ test cho phần thực nghiệm (Chương 4) của báo cáo BTL số 1.
Cần Node.js 22 trở lên và Google Chrome.

```bash
npm install
npm test
npm run e2e
node scripts/do_bo_test.mjs test/a_ky_thuat.test.mjs test/ai_day_du_1.test.mjs
```

- `DacTa.md`: đặc tả chương trình.
- `src/diem.js`: hàm tính điểm, bản đã sửa; `web/index.html`: giao diện web.
- `lichsu/diem_loi_lamtron.js` (lỗi D1) và `lichsu/diem_loi_kiemtra.js` (lỗi D2): hai bản có lỗi dùng để đo.
- `test/a_ky_thuat.test.mjs`: bộ A, theo kỹ thuật hộp đen.
- `test/hoi_quy.test.mjs`: 4 ca hồi quy cho lỗi D2, thêm sau khi tìm ra lỗi.
- `test/ai_*.test.mjs`: chín bộ do AI sinh, lời nhắc ở `LoiNhac.md`.
- `e2e/tinh_diem.spec.mjs`: 9 ca kiểm thử giao diện bằng Playwright.
- `scripts/do_bo_test.mjs`: đo độ bao phủ, điểm đột biến (Stryker) và khả năng bắt hai lỗi.
- `KetQua/`: kết quả đo và ảnh chụp; `KetQua/lan_do_dau/` là lần đo đầu, trước khi sửa lỗi D2.
