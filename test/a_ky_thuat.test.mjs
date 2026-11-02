import { test } from "node:test";
import assert from "node:assert/strict";
import { tinhDiemHocPhan } from "../src/diem.js";

const HOP_LE = { chuyenCan: 8, baiTap: 8, kiemTra: 8, thi: 8 };
const TRUONG = ["chuyenCan", "baiTap", "kiemTra", "thi"];
const KHONG_HOP_LE = ["8", null, undefined, NaN, Infinity, -0.1, 10.1, 7.55];

for (const truong of TRUONG) {
  for (const giaTri of KHONG_HOP_LE) {
    test(`LHTD: ${truong} = ${String(giaTri)} bi tu choi`, () => {
      assert.throws(() => tinhDiemHocPhan({ ...HOP_LE, [truong]: giaTri }), (e) => {
        assert.ok(e instanceof RangeError);
        assert.equal(e.code, "DIEM_KHONG_HOP_LE");
        assert.equal(e.truong, truong);
        return true;
      });
    });
  }
  for (const giaTri of [0, 0.1, 9.9, 10]) {
    if (truong === "chuyenCan" && giaTri < 5) continue;
    test(`Bien: ${truong} = ${giaTri} hop le`, () => {
      assert.doesNotThrow(() => tinhDiemHocPhan({ ...HOP_LE, [truong]: giaTri }));
    });
  }
}

test("Thu tu kiem tra: bao truong sai dau tien", () => {
  assert.throws(
    () => tinhDiemHocPhan({ chuyenCan: 8, baiTap: -1, kiemTra: 11, thi: "x" }),
    (e) => e.truong === "baiTap",
  );
});

const BANG = [
  ["cam thi tai bien 4.9", { chuyenCan: 4.9, baiTap: 10, kiemTra: 10, thi: 10 }, [0, "F", "CAM_THI"]],
  ["chuyen can 5 khong bi cam thi", { chuyenCan: 5, baiTap: 8, kiemTra: 8, thi: 8 }, [7.7, "B", "DAT"]],
  ["cam thi uu tien hon diem liet", { chuyenCan: 4, baiTap: 8, kiemTra: 8, thi: 2 }, [0, "F", "CAM_THI"]],
  ["chuyen can 0 bi cam thi", { chuyenCan: 0, baiTap: 0, kiemTra: 0, thi: 0 }, [0, "F", "CAM_THI"]],
  ["diem liet tai bien 2.9", { chuyenCan: 10, baiTap: 10, kiemTra: 10, thi: 2.9 }, [6.5, "F", "KHONG_DAT"]],
  ["thi 3 khong bi diem liet", { chuyenCan: 10, baiTap: 10, kiemTra: 10, thi: 3 }, [6.5, "C+", "DAT"]],
  ["moi thanh phan bang 0 tru chuyen can", { chuyenCan: 5, baiTap: 0, kiemTra: 0, thi: 0 }, [0.5, "F", "KHONG_DAT"]],
  ["diem toi da", { chuyenCan: 10, baiTap: 10, kiemTra: 10, thi: 10 }, [10, "A+", "DAT"]],
  ["lam tron nua len 7.25", { chuyenCan: 10, baiTap: 7.5, kiemTra: 7.5, thi: 6.5 }, [7.3, "B", "DAT"]],
  ["lam tron xuong 7.24", { chuyenCan: 8.9, baiTap: 7.5, kiemTra: 7.5, thi: 6.7 }, [7.2, "B", "DAT"]],
  ["trong so dung tung thanh phan", { chuyenCan: 6, baiTap: 9, kiemTra: 7, thi: 5 }, [6.3, "C", "DAT"]],
  ["sai so nhi phan 4.45 lam tron thanh 4.5", { chuyenCan: 5, baiTap: 9, kiemTra: 2, thi: 3.5 }, [4.5, "D", "DAT"]],
  ["sai so nhi phan 4.95 lam tron thanh 5", { chuyenCan: 5, baiTap: 9, kiemTra: 2, thi: 4.5 }, [5, "D+", "DAT"]],
  ["sai so nhi phan 5.45 lam tron thanh 5.5", { chuyenCan: 5, baiTap: 9, kiemTra: 2, thi: 5.5 }, [5.5, "C", "DAT"]],
  ["bien F 3.9", { chuyenCan: 5, baiTap: 3.5, kiemTra: 3.5, thi: 4 }, [3.9, "F", "KHONG_DAT"]],
  ["bien D 4.0", { chuyenCan: 5, baiTap: 4, kiemTra: 3.5, thi: 4 }, [4, "D", "DAT"]],
  ["bien D 4.9", { chuyenCan: 5, baiTap: 5, kiemTra: 5, thi: 4.8 }, [4.9, "D", "DAT"]],
];

for (const [ten, diem, [tongKet, diemChu, trangThai]] of BANG) {
  test(`BQD: ${ten}`, () => {
    assert.deepEqual(tinhDiemHocPhan(diem), { tongKet, diemChu, trangThai });
  });
}

const THANG = [
  [5, "D+"], [5.4, "D+"], [5.5, "C"], [6.4, "C"], [6.5, "C+"], [6.9, "C+"],
  [7, "B"], [7.9, "B"], [8, "B+"], [8.4, "B+"], [8.5, "A"], [8.9, "A"], [9, "A+"], [10, "A+"],
];

for (const [x, diemChu] of THANG) {
  test(`Bien thang diem: ${x} la ${diemChu}`, () => {
    const kq = tinhDiemHocPhan({ chuyenCan: x, baiTap: x, kiemTra: x, thi: x });
    assert.deepEqual(kq, { tongKet: x, diemChu, trangThai: "DAT" });
  });
}
