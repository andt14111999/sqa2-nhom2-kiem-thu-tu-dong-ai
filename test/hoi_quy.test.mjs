import { test } from "node:test";
import assert from "node:assert/strict";
import { tinhDiemHocPhan } from "../src/diem.js";

for (const truong of ["chuyenCan", "baiTap", "kiemTra", "thi"]) {
  test(`Hoi quy: ${truong} = 0.1 + 0.2 co hon 1 chu so thap phan nen bi tu choi`, () => {
    const diem = { chuyenCan: 8, baiTap: 8, kiemTra: 8, thi: 8, [truong]: 0.1 + 0.2 };
    assert.throws(() => tinhDiemHocPhan(diem), (e) => e.code === "DIEM_KHONG_HOP_LE" && e.truong === truong);
  });
}
