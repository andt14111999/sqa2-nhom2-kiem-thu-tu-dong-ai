import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

const GOC = new URL("..", import.meta.url).pathname;
const NODE = process.execPath;

function chay(tep, thuMuc = GOC, boQua = []) {
  const thamSo = ["--test", "--test-reporter=tap", ...boQua.map((t) => `--test-skip-pattern=${thoat(t)}$`), tep];
  const r = spawnSync(NODE, thamSo, { cwd: thuMuc, encoding: "utf8" });
  const dong = r.stdout.split("\n");
  const lay = (k) => Number((dong.find((d) => d.startsWith(`# ${k} `)) ?? "").split(" ")[2] ?? 0);
  const sai = [];
  let thuLuiTruoc = -1;
  for (const d of dong) {
    const m = d.match(/^(\s*)not ok \d+ - (.*?)(\s+# .*)?$/);
    if (!m) continue;
    if (m[1].length >= thuLuiTruoc || thuLuiTruoc < 0) sai.push(m[2]);
    thuLuiTruoc = m[1].length;
  }
  return { tong: lay("tests"), dat: lay("pass"), sai: [...new Set(sai)] };
}

function thoat(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function doPhuSong(tep, boQua) {
  const thamSo = ["--test", "--experimental-test-coverage", "--test-coverage-include=src/diem.js", "--test-reporter=spec",
    ...boQua.map((t) => `--test-skip-pattern=${thoat(t)}$`), tep];
  const r = spawnSync(NODE, thamSo, { cwd: GOC, encoding: "utf8" });
  const m = r.stdout.match(/diem\.js\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/);
  return m ? { dong: Number(m[1]), nhanh: Number(m[2]), ham: Number(m[3]) } : null;
}

function doDotBien(tep, boQua, ten) {
  const lenh = [NODE, "--test", ...boQua.map((t) => `"--test-skip-pattern=${thoat(t).replace(/"/g, '\\"')}$"`), tep].join(" ");
  const cauHinh = {
    testRunner: "command",
    commandRunner: { command: lenh },
    mutate: ["src/diem.js"],
    reporters: ["json"],
    jsonReporter: { fileName: `KetQua/dotbien_${ten}.json` },
    concurrency: 6,
    timeoutMS: 8000,
    ignorePatterns: ["KetQua", "reports", "lichsu"],
    tempDirName: `.stryker-tmp`,
    cleanTempDir: "always",
  };
  const tepCauHinh = join(GOC, `.stryker.${ten}.json`);
  writeFileSync(tepCauHinh, JSON.stringify(cauHinh));
  const r = spawnSync(join(GOC, "node_modules/.bin/stryker"), ["run", tepCauHinh], { cwd: GOC, encoding: "utf8" });
  rmSync(tepCauHinh);
  const tepKq = join(GOC, `KetQua/dotbien_${ten}.json`);
  if (!existsSync(tepKq) || r.status !== 0) throw new Error(`stryker loi voi ${ten}: ${r.stdout.slice(-800)} ${r.stderr.slice(-800)}`);
  const bien = Object.values(JSON.parse(readFileSync(tepKq, "utf8")).files).flatMap((f) => f.mutants);
  rmSync(tepKq);
  const dem = (s) => bien.filter((m) => m.status === s).length;
  const song = bien.filter((m) => m.status === "Survived" || m.status === "NoCoverage");
  const diem = bien.filter((m) => ["Killed", "Timeout", "Survived", "NoCoverage"].includes(m.status)).length;
  return {
    tong: diem, diet: dem("Killed") + dem("Timeout"), song: song.length,
    tiLe: Math.round(((dem("Killed") + dem("Timeout")) / diem) * 1000) / 10,
    danhSachSong: song.map((m) => ({ loai: m.mutatorName, dong: m.location.start.line, cot: m.location.start.column, thayBang: m.replacement })),
  };
}

function batLoi(banLoi, tep, datTrenBanDung) {
  const tam = mkdtempSync(join(tmpdir(), "banloi-"));
  cpSync(join(GOC, "lichsu", banLoi), join(tam, "src/diem.js"), { recursive: true });
  cpSync(join(GOC, "package.json"), join(tam, "package.json"));
  cpSync(join(GOC, tep), join(tam, tep));
  const r = chay(tep, tam, datTrenBanDung);
  rmSync(tam, { recursive: true, force: true });
  return r.sai;
}

const ketQua = {};
for (const tep of process.argv.slice(2)) {
  const ten = basename(tep).replace(/\.test\.mjs$/, "");
  const dung = chay(tep);
  const kq = {
    soTest: dung.tong, datTrenBanDung: dung.dat, saiTrenBanDung: dung.sai,
    phuSong: doPhuSong(tep, dung.sai),
    dotBien: doDotBien(tep, dung.sai, ten),
    batLoiLamTron: batLoi("diem_loi_lamtron.js", tep, dung.sai),
    batLoiKiemTra: batLoi("diem_loi_kiemtra.js", tep, dung.sai),
  };
  ketQua[ten] = kq;
  writeFileSync(join(GOC, `KetQua/ketqua_${ten}.json`), JSON.stringify(kq, null, 2));
  console.log(ten, JSON.stringify({ ...kq, dotBien: { ...kq.dotBien, danhSachSong: kq.dotBien.danhSachSong.length } }));
}
