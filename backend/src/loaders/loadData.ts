import fs from "fs";
import path from "path";
import { db } from "../db";

const DATA_DIR = path.join(__dirname, "..", "..",".." ,"data");

function loadJson(fileName: string) {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function loadData() {
  db.serialize(() => {
    // ---- Accounts ----
    const accounts = loadJson("accounts.json");
    const accountStmt = db.prepare(`
      INSERT OR IGNORE INTO accounts (account_id, name, industry, segment)
      VALUES (?, ?, ?, ?)
    `);

    accounts.forEach((a: any) => {
      accountStmt.run(
        a.account_id,
        a.name,
        a.industry ?? null,
        a.segment ?? null
      );
    });
    accountStmt.finalize();

    // ---- Reps ----
    const reps = loadJson("reps.json");
    const repStmt = db.prepare(`
      INSERT OR IGNORE INTO reps (rep_id, name)
      VALUES (?, ?)
    `);

    reps.forEach((r: any) => {
      repStmt.run(r.rep_id, r.name);
    });
    repStmt.finalize();
    // ---- Deals ----
    const deals = loadJson("deals.json");
    const dealStmt = db.prepare(`
      INSERT OR IGNORE INTO deals
      (deal_id, account_id, rep_id, stage, amount, created_at, closed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    deals.forEach((d: any) => {
      dealStmt.run(
        d.deal_id,
        d.account_id,
        d.rep_id,
        d.stage,
        d.amount ?? 0,
        d.created_at,
        d.closed_at
      );
    });
    dealStmt.finalize();
    // ---- Activities ----
    const activities = loadJson("activities.json");
    const activityStmt = db.prepare(`
      INSERT OR IGNORE INTO activities
      (activity_id, deal_id, type, timestamp)
      VALUES (?, ?, ?, ?)
    `);

    activities.forEach((a: any) => {
      activityStmt.run(
        a.activity_id,
        a.deal_id,
        a.type,
        a.timestamp
      );
    });
    activityStmt.finalize();

    // ---- Targets ----
    const targets = loadJson("targets.json");
    const targetStmt = db.prepare(`
      INSERT OR IGNORE INTO targets (month, target)
      VALUES (?, ?)
    `);

    targets.forEach((t: any) => {
      targetStmt.run(t.month, t.target);
    });
    targetStmt.finalize();
  });
}
