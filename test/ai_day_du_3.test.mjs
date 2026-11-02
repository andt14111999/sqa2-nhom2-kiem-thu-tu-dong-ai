import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { tinhDiemHocPhan } from "../src/diem.js";

const TRUONG = ["chuyenCan", "baiTap", "kiemTra", "thi"];
const HOP_LE = { chuyenCan: 7, baiTap: 7, kiemTra: 7, thi: 7 };

function diem(chuyenCan, baiTap, kiemTra, thi) {
  return { chuyenCan, baiTap, kiemTra, thi };
}

function loiDiem(truong) {
  return (err) => {
    assert.ok(err instanceof RangeError, "phải là RangeError");
    assert.equal(err.code, "DIEM_KHONG_HOP_LE");
    assert.equal(err.truong, truong);
    return true;
  };
}

function xepLoai(t10) {
  if (t10 >= 90) return "A+";
  if (t10 >= 85) return "A";
  if (t10 >= 80) return "B+";
  if (t10 >= 70) return "B";
  if (t10 >= 65) return "C+";
  if (t10 >= 55) return "C";
  if (t10 >= 50) return "D+";
  if (t10 >= 40) return "D";
  return "F";
}

function moHinh(cc, bt, kt, thi) {
  if (cc < 50) return { tongKet: 0, diemChu: "F", trangThai: "CAM_THI" };
  const t10 = Math.floor((cc + 2 * bt + 2 * kt + 5 * thi + 5) / 10);
  const diemChu = thi < 30 ? "F" : xepLoai(t10);
  return {
    tongKet: t10 / 10,
    diemChu,
    trangThai: diemChu === "F" ? "KHONG_DAT" : "DAT",
  };
}

function kiemTraMotCa(cc, bt, kt, thi) {
  const vao = diem(cc / 10, bt / 10, kt / 10, thi / 10);
  assert.deepStrictEqual(
    tinhDiemHocPhan(vao),
    moHinh(cc, bt, kt, thi),
    `chuyenCan=${vao.chuyenCan} baiTap=${vao.baiTap} kiemTra=${vao.kiemTra} thi=${vao.thi}`,
  );
}

function chayBang(bang) {
  for (const [cc, bt, kt, thi, tongKet, diemChu, trangThai] of bang) {
    test(`chuyenCan=${cc} baiTap=${bt} kiemTra=${kt} thi=${thi} cho ${tongKet} ${diemChu} ${trangThai}`, () => {
      assert.deepStrictEqual(tinhDiemHocPhan(diem(cc, bt, kt, thi)), {
        tongKet,
        diemChu,
        trangThai,
      });
    });
  }
}

const GIA_TRI_SAI = [
  ["-0.1", -0.1],
  ["10.1", 10.1],
  ["-1", -1],
  ["100", 100],
  ["NaN", NaN],
  ["Infinity", Infinity],
  ["-Infinity", -Infinity],
  ["chuỗi \"7\"", "7"],
  ["null", null],
  ["undefined", undefined],
  ["true", true],
  ["7.25 (hai chữ số thập phân)", 7.25],
  ["0.1 + 0.2 (sai số nhị phân)", 0.1 + 0.2],
  ["9.99", 9.99],
  ["5.55", 5.55],
  ["đối tượng rỗng", {}],
];

describe("điểm thành phần không hợp lệ ném RangeError DIEM_KHONG_HOP_LE", () => {
  for (const truong of TRUONG) {
    for (const [nhan, giaTri] of GIA_TRI_SAI) {
      test(`${truong} = ${nhan}`, () => {
        assert.throws(
          () => tinhDiemHocPhan({ ...HOP_LE, [truong]: giaTri }),
          loiDiem(truong),
        );
      });
    }
  }
});

describe("thiếu trường điểm", () => {
  for (const truong of TRUONG) {
    test(`thiếu ${truong}`, () => {
      const vao = { ...HOP_LE };
      delete vao[truong];
      assert.throws(() => tinhDiemHocPhan(vao), loiDiem(truong));
    });
  }
});

describe("thứ tự báo trường sai đầu tiên", () => {
  test("cả bốn trường sai thì báo chuyenCan", () => {
    assert.throws(
      () => tinhDiemHocPhan(diem(-1, -1, -1, -1)),
      loiDiem("chuyenCan"),
    );
  });

  test("baiTap, kiemTra, thi sai thì báo baiTap", () => {
    assert.throws(
      () => tinhDiemHocPhan(diem(7, 11, -1, NaN)),
      loiDiem("baiTap"),
    );
  });

  test("kiemTra và thi sai thì báo kiemTra", () => {
    assert.throws(
      () => tinhDiemHocPhan(diem(7, 7, 10.5, 11)),
      loiDiem("kiemTra"),
    );
  });

  test("chỉ thi sai thì báo thi", () => {
    assert.throws(() => tinhDiemHocPhan(diem(7, 7, 7, 10.1)), loiDiem("thi"));
  });

  test("thứ tự khóa trong đối tượng không ảnh hưởng, cả bốn sai báo chuyenCan", () => {
    assert.throws(
      () =>
        tinhDiemHocPhan({ thi: 11, kiemTra: 11, baiTap: 11, chuyenCan: 11 }),
      loiDiem("chuyenCan"),
    );
  });

  test("thứ tự khóa trong đối tượng không ảnh hưởng, kiemTra và thi sai báo kiemTra", () => {
    assert.throws(
      () => tinhDiemHocPhan({ thi: 11, kiemTra: 11, baiTap: 5, chuyenCan: 5 }),
      loiDiem("kiemTra"),
    );
  });

  test("sai nhiều kiểu khác nhau vẫn báo trường đầu tiên theo thứ tự", () => {
    assert.throws(
      () => tinhDiemHocPhan(diem(7, "5", NaN, 11)),
      loiDiem("baiTap"),
    );
  });
});

describe("kiểm tra hợp lệ được thực hiện trước quy tắc cấm thi", () => {
  test("chuyenCan 3 và thi 11 thì báo thi", () => {
    assert.throws(() => tinhDiemHocPhan(diem(3, 7, 7, 11)), loiDiem("thi"));
  });

  test("chuyenCan 3 và baiTap -1 thì báo baiTap", () => {
    assert.throws(() => tinhDiemHocPhan(diem(3, -1, 7, 7)), loiDiem("baiTap"));
  });

  test("chuyenCan 3 và kiemTra 10.5 thì báo kiemTra", () => {
    assert.throws(
      () => tinhDiemHocPhan(diem(3, 7, 10.5, 7)),
      loiDiem("kiemTra"),
    );
  });

  test("chuyenCan -1 nhỏ hơn 5 nhưng không hợp lệ thì ném lỗi chứ không CAM_THI", () => {
    assert.throws(
      () => tinhDiemHocPhan(diem(-1, 7, 7, 7)),
      loiDiem("chuyenCan"),
    );
  });

  test("chuyenCan 4.95 có hai chữ số thập phân thì ném lỗi chứ không CAM_THI", () => {
    assert.throws(
      () => tinhDiemHocPhan(diem(4.95, 7, 7, 7)),
      loiDiem("chuyenCan"),
    );
  });
});

describe("mọi giá trị từ 0 đến 10 bước 0,1 đều hợp lệ", () => {
  for (const truong of TRUONG) {
    test(`${truong} nhận 101 giá trị từ 0 đến 10`, () => {
      for (let k = 0; k <= 100; k++) {
        const vao = { ...HOP_LE, [truong]: k / 10 };
        assert.doesNotThrow(() => tinhDiemHocPhan(vao), `${truong} = ${k / 10}`);
      }
    });
  }
});

describe("quy tắc cấm thi và biên chuyenCan 5", () => {
  chayBang([
    [4.9, 10, 10, 10, 0, "F", "CAM_THI"],
    [0, 10, 10, 10, 0, "F", "CAM_THI"],
    [4.9, 0, 0, 0, 0, "F", "CAM_THI"],
    [0.1, 5, 5, 5, 0, "F", "CAM_THI"],
    [4, 8, 8, 8, 0, "F", "CAM_THI"],
    [4.9, 10, 10, 0, 0, "F", "CAM_THI"],
    [5, 10, 10, 10, 9.5, "A+", "DAT"],
    [5, 0, 0, 0, 0.5, "F", "KHONG_DAT"],
  ]);
});

describe("tính tổng kết, làm tròn nửa lên và xếp loại", () => {
  chayBang([
    [10, 10, 10, 10, 10, "A+", "DAT"],
    [5, 5, 5, 5, 5, "D+", "DAT"],
    [6, 7, 8, 9, 8.1, "B+", "DAT"],
    [8, 7, 6, 5, 5.9, "C", "DAT"],
    [7, 8, 9, 10, 9.1, "A+", "DAT"],
    [5, 0, 0, 10, 5.5, "C", "DAT"],
    [5, 0, 0, 8, 4.5, "D", "DAT"],
    [5, 10, 10, 4, 6.5, "C+", "DAT"],
    [7.3, 6.1, 8.8, 5.5, 6.5, "C+", "DAT"],
    [5.5, 0, 0, 0, 0.6, "F", "KHONG_DAT"],
    [5.1, 0, 0, 0, 0.5, "F", "KHONG_DAT"],
    [10, 0, 0, 0, 1, "F", "KHONG_DAT"],
    [5, 0, 0, 3, 2, "F", "KHONG_DAT"],
    [5, 7.5, 7.5, 7.5, 7.3, "B", "DAT"],
    [5.4, 8, 8, 7, 7.2, "B", "DAT"],
    [5.5, 9.5, 10, 9, 9, "A+", "DAT"],
    [5.4, 9.5, 10, 9, 8.9, "A", "DAT"],
    [5.5, 9.5, 10, 8, 8.5, "A", "DAT"],
    [5.4, 9.5, 10, 8, 8.4, "B+", "DAT"],
    [5.5, 9.5, 10, 7, 8, "B+", "DAT"],
    [5.4, 9.5, 10, 7, 7.9, "B", "DAT"],
    [5.5, 8.5, 8.5, 6, 7, "B", "DAT"],
    [5.4, 8.5, 8.5, 6, 6.9, "C+", "DAT"],
    [5.5, 7.5, 7, 6, 6.5, "C+", "DAT"],
    [5.4, 7.5, 7, 6, 6.4, "C", "DAT"],
    [5.5, 6, 6, 5, 5.5, "C", "DAT"],
    [5.4, 6, 6, 5, 5.4, "D+", "DAT"],
    [5.5, 6, 6, 4, 5, "D+", "DAT"],
    [5.4, 6, 6, 4, 4.9, "D", "DAT"],
    [5.5, 5, 4.5, 3, 4, "D", "DAT"],
    [5.4, 5, 4.5, 3, 3.9, "F", "KHONG_DAT"],
    [5, 9.5, 10, 9, 8.9, "A", "DAT"],
    [10, 10, 10, 8, 9, "A+", "DAT"],
  ]);
});

describe("thi dưới 3 thì rớt nhưng vẫn tính tổng kết", () => {
  chayBang([
    [10, 10, 10, 2.9, 6.5, "F", "KHONG_DAT"],
    [10, 10, 10, 0, 5, "F", "KHONG_DAT"],
    [10, 10, 10, 3, 6.5, "C+", "DAT"],
    [5, 10, 10, 2.9, 6, "F", "KHONG_DAT"],
    [10, 10, 10, 1, 5.5, "F", "KHONG_DAT"],
    [10, 10, 10, 2.5, 6.3, "F", "KHONG_DAT"],
    [9, 10, 10, 2, 5.9, "F", "KHONG_DAT"],
    [6, 10, 10, 2.9, 6.1, "F", "KHONG_DAT"],
  ]);
});

describe("so khớp mô hình số học số nguyên và tính chất chung", () => {
  test("20000 bộ điểm ngẫu nhiên cố định", () => {
    let hat = 123456789;
    const tiep = (n) => {
      hat = (Math.imul(hat, 1664525) + 1013904223) >>> 0;
      return (hat >>> 8) % n;
    };
    for (let i = 0; i < 20000; i++) {
      const cc = i % 5 === 0 ? tiep(101) : 50 + tiep(51);
      const bt = tiep(101);
      const kt = tiep(101);
      const thi = i % 7 === 0 ? tiep(30) : tiep(101);
      kiemTraMotCa(cc, bt, kt, thi);
    }
  });

  test("lưới bộ điểm đầy đủ theo chuyenCan và thi", () => {
    const mauBaiTap = [0, 33, 100];
    const mauKiemTra = [0, 88, 100];
    for (let cc = 0; cc <= 100; cc++) {
      for (let thi = 0; thi <= 100; thi++) {
        for (const bt of mauBaiTap) {
          for (const kt of mauKiemTra) {
            kiemTraMotCa(cc, bt, kt, thi);
          }
        }
      }
    }
  });

  test("điểm tổng kết nằm đúng giữa hai mức luôn được làm tròn lên", () => {
    let soCaHoa = 0;
    for (let cc = 50; cc <= 100; cc++) {
      for (let thi = 30; thi <= 100; thi++) {
        for (const bt of [0, 15, 40, 77, 100]) {
          for (const kt of [0, 25, 60, 91, 100]) {
            const phanTram = cc + 2 * bt + 2 * kt + 5 * thi;
            if (phanTram % 10 !== 5) continue;
            soCaHoa++;
            const kq = tinhDiemHocPhan(diem(cc / 10, bt / 10, kt / 10, thi / 10));
            assert.equal(
              kq.tongKet,
              (phanTram + 5) / 10 / 10,
              `chuyenCan=${cc / 10} baiTap=${bt / 10} kiemTra=${kt / 10} thi=${thi / 10}`,
            );
          }
        }
      }
    }
    assert.ok(soCaHoa > 100);
  });

  test("không thay đổi đối tượng đầu vào và lần gọi nào cũng cho cùng kết quả", () => {
    const vao = Object.freeze(diem(6, 7, 8, 9));
    const lan1 = tinhDiemHocPhan(vao);
    const lan2 = tinhDiemHocPhan(vao);
    assert.deepStrictEqual(lan1, lan2);
    assert.deepStrictEqual(vao, { chuyenCan: 6, baiTap: 7, kiemTra: 8, thi: 9 });
  });

  test("kết quả chỉ gồm tongKet kiểu number, diemChu và trangThai kiểu chuỗi", () => {
    const kq = tinhDiemHocPhan(diem(8, 8, 8, 8));
    assert.deepStrictEqual(Object.keys(kq).sort(), [
      "diemChu",
      "tongKet",
      "trangThai",
    ]);
    assert.equal(typeof kq.tongKet, "number");
    assert.equal(typeof kq.diemChu, "string");
    assert.equal(typeof kq.trangThai, "string");
    assert.deepStrictEqual(kq, { tongKet: 8, diemChu: "B+", trangThai: "DAT" });
  });
});
