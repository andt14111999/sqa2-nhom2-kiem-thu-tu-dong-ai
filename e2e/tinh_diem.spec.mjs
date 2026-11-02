import { test, expect } from "@playwright/test";

async function nhap(page, { cc, bt, kt, t }) {
  await page.goto("/");
  await page.getByLabel("Chuyên cần").fill(cc);
  await page.getByLabel("Bài tập").fill(bt);
  await page.getByLabel("Kiểm tra").fill(kt);
  await page.getByLabel("Thi").fill(t);
  await page.getByRole("button", { name: "Tính điểm" }).click();
}

const HOP_LE = [
  ["sinh viên đạt", { cc: "10", bt: "7.5", kt: "7.5", t: "6.5" }, "Tổng kết: 7.3 - Điểm chữ: B - Trạng thái: DAT"],
  ["bị cấm thi", { cc: "4.9", bt: "10", kt: "10", t: "10" }, "Tổng kết: 0 - Điểm chữ: F - Trạng thái: CAM_THI"],
  ["điểm thi dưới 3", { cc: "10", bt: "10", kt: "10", t: "2.9" }, "Tổng kết: 6.5 - Điểm chữ: F - Trạng thái: KHONG_DAT"],
  ["lỗi làm tròn số thực", { cc: "5", bt: "9", kt: "2", t: "4.5" }, "Tổng kết: 5 - Điểm chữ: D+ - Trạng thái: DAT"],
];

for (const [ten, diem, ketQua] of HOP_LE) {
  test(`Kết quả hợp lệ: ${ten}`, async ({ page }) => {
    await nhap(page, diem);
    await expect(page.getByRole("status")).toHaveText(ketQua);
    await expect(page.getByRole("alert")).toBeEmpty();
  });
}

const KHONG_HOP_LE = [
  ["để trống điểm thi", { cc: "8", bt: "8", kt: "8", t: "" }, "Điểm không hợp lệ: Thi"],
  ["chữ thay cho số", { cc: "8", bt: "abc", kt: "8", t: "8" }, "Điểm không hợp lệ: Bài tập"],
  ["vượt quá 10", { cc: "10.1", bt: "8", kt: "8", t: "8" }, "Điểm không hợp lệ: Chuyên cần"],
];

for (const [ten, diem, thongBao] of KHONG_HOP_LE) {
  test(`Báo lỗi: ${ten}`, async ({ page }) => {
    await nhap(page, diem);
    await expect(page.getByRole("alert")).toHaveText(thongBao);
    await expect(page.getByRole("status")).toBeEmpty();
  });
}

test("Kết quả cũ biến mất khi lần nhập sau không hợp lệ", async ({ page }) => {
  await nhap(page, { cc: "8", bt: "8", kt: "8", t: "8" });
  await expect(page.getByRole("status")).toHaveText("Tổng kết: 8 - Điểm chữ: B+ - Trạng thái: DAT");
  await page.getByLabel("Thi").fill("11");
  await page.getByRole("button", { name: "Tính điểm" }).click();
  await expect(page.getByRole("alert")).toHaveText("Điểm không hợp lệ: Thi");
  await expect(page.getByRole("status")).toBeEmpty();
  await page.screenshot({ path: "KetQua/anh_giao_dien_loi.png" });
});

test("Chụp màn hình kết quả hợp lệ", async ({ page }) => {
  await nhap(page, { cc: "10", bt: "7.5", kt: "7.5", t: "6.5" });
  await expect(page.getByRole("status")).toHaveText(/Tổng kết: 7.3/);
  await page.screenshot({ path: "KetQua/anh_giao_dien.png" });
});
