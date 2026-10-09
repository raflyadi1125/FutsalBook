import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const PORT = Number(process.env.DB_PORT) || 3306;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isListening(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
}

function findServerBinary() {
  if (process.env.DB_SERVER_BIN && fs.existsSync(process.env.DB_SERVER_BIN)) {
    return process.env.DB_SERVER_BIN;
  }
  const xamppMysql = "C:\\xampp\\mysql\\bin\\mysqld.exe";
  if (fs.existsSync(xamppMysql)) return xamppMysql;
  const bins = ["mariadbd.exe", "mysqld.exe"];
  for (const root of ["C:\\Program Files", "C:\\Program Files (x86)"]) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root)) {
      const candidates = [];
      if (/^MariaDB/i.test(entry) || /^MySQL/i.test(entry)) {
        candidates.push(path.join(root, entry, "bin"));
        const nested = path.join(root, entry);
        try {
          for (const sub of fs.readdirSync(nested)) {
            candidates.push(path.join(nested, sub, "bin"));
          }
        } catch {}
      }
      for (const dir of candidates) {
        for (const bin of bins) {
          const full = path.join(dir, bin);
          if (fs.existsSync(full)) return full;
        }
      }
    }
  }
  return null;
}

function findConfig(serverBin) {
  if (process.env.DB_CONFIG && fs.existsSync(process.env.DB_CONFIG)) return process.env.DB_CONFIG;
  const xamppIni = "C:\\xampp\\mysql\\bin\\my.ini";
  if (fs.existsSync(xamppIni) && serverBin.toLowerCase().includes("xampp")) return xamppIni;
  const local = path.join(os.homedir(), "AppData", "Local", "MariaDB", "my.ini");
  if (fs.existsSync(local)) return local;
  const installIni = path.join(path.dirname(path.dirname(serverBin)), "data", "my.ini");
  return fs.existsSync(installIni) ? installIni : null;
}

async function main() {
  if (await isListening(PORT)) {
    console.log(`Database sudah berjalan di port ${PORT}`);
    return;
  }

  const serverBin = findServerBinary();
  if (!serverBin) {
    console.log("MySQL/MariaDB belum terinstall — lewati menjalankan database.");
    console.log("Install dulu (mis. winget install MariaDB.Server) lalu jalankan: npm run db:init");
    return;
  }

  const config = findConfig(serverBin);
  const args = config ? [`--defaults-file=${config}`] : [];
  const child = spawn(serverBin, args, { detached: true, stdio: "ignore" });
  child.unref();

  for (let i = 0; i < 30; i++) {
    await sleep(500);
    if (await isListening(PORT)) {
      console.log(`Database (${path.basename(serverBin)}) berjalan di port ${PORT}`);
      return;
    }
  }

  console.log(`Database gagal start di port ${PORT}.`);
  console.log(`Coba jalankan manual: "${serverBin}" ${args.join(" ")}`);
  process.exitCode = 1;
}

main();
