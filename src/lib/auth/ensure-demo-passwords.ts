import bcrypt from "bcryptjs";
import type Database from "better-sqlite3";

let appliedFor = "";

/**
 * When DEMO_PASSWORD is set (Vercel / hosted), rehash all users so demo
 * logins work without shipping a known password inside the SQLite file.
 */
export function ensureDemoPasswords(sqlite: Database.Database) {
  const password = process.env.DEMO_PASSWORD?.trim();
  if (!password) return;
  if (appliedFor === password) return;

  const users = sqlite
    .prepare(`SELECT id, password_hash FROM users`)
    .all() as { id: string; password_hash: string }[];
  if (!users.length) {
    appliedFor = password;
    return;
  }

  const alreadyOk = users.every((u) =>
    bcrypt.compareSync(password, u.password_hash)
  );
  if (alreadyOk) {
    appliedFor = password;
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const upd = sqlite.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`);
  const tx = sqlite.transaction(() => {
    for (const u of users) upd.run(hash, u.id);
  });
  tx();
  appliedFor = password;
}
