import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const schemaPath = path.join(root, "database", "schema.sql");

function findClient() {
  if (process.env.DB_CLIENT_BIN && fs.existsSync(process.env.DB_CLIENT_BIN)) {
    return process.env.DB_CLIENT_BIN;
  }
  const xamppClient = "C:\\xampp\\mysql\\bin\\mysql.exe";
  if (fs.existsSync(xamppClient)) return xamppClient;
  for (const rootDir of ["C:\\Program Files", "C:\\Program Files (x86)"]) {
    if (!fs.existsSync(rootDir)) continue;
    for (const entry of fs.readdirSync(rootDir)) {
      if (!/^MariaDB|^MySQL/i.test(entry)) continue;
      const candidates = [path.join(rootDir, entry, "bin")];
      try {
        for (const sub of fs.readdirSync(path.join(rootDir, entry))) {
          candidates.push(path.join(rootDir, entry, sub, "bin"));
        }
      } catch {}
      for (const dir of candidates) {
        for (const bin of ["mariadb.exe", "mysql.exe"]) {
          const full = path.join(dir, bin);
          if (fs.existsSync(full)) return full;
        }
      }
    }
  }
  return null;
}

const client = findClient();
if (!client) {
  console.log("Klien MySQL/MariaDB tidak ditemukan — install database dulu.");
  process.exit(1);
}
if (!fs.existsSync(schemaPath)) {
  console.log(`File skema tidak ada: ${schemaPath}`);
  process.exit(1);
}

console.log(`Import ${path.relative(root, schemaPath)} memakai ${client}`);
const child = spawn(client, ["-u", process.env.DB_USER || "root"], {
  stdio: ["pipe", "inherit", "inherit"],
});
fs.createReadStream(schemaPath).pipe(child.stdin);
child.on("exit", (code) => {
  if (code === 0) console.log("Import selesai.");
  process.exit(code ?? 1);
});
