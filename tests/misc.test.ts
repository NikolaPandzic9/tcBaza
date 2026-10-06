import sharp from "sharp";
import { beforeEach, describe, expect, it } from "vitest";
import { SYSTEM_ACTOR } from "@/server/audit";
import { toCsv } from "@/server/csv";
import type { Database } from "@/server/db/client";
import { escapeLike } from "@/server/db/sql";
import { MediaError, processUpload } from "@/server/media/media";
import { UserError, createUser, deleteUser, updateUser } from "@/server/users";
import { resetDatabase } from "./db";

let db: Database;

beforeEach(async () => {
  db = await resetDatabase();
});

describe("helpers", () => {
  it("escapes LIKE wildcards", () => {
    expect(escapeLike("50%_a\\b")).toBe("50\\%\\_a\\\\b");
  });

  it("neutralises spreadsheet formulas in CSV exports", () => {
    const csv = toCsv(["Ime"], [["=HYPERLINK(\"http://x\")"], ["Ana; Marić"], ["-5"]]);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain('"Ana; Marić"');
    expect(csv).toContain("'-5");
  });
});

describe("media processing", () => {
  it("re-encodes images to WebP, capped at 2400px", async () => {
    const big = await sharp({ create: { width: 3000, height: 1500, channels: 3, background: "#1a3665" } }).jpeg().toBuffer();
    const out = await processUpload("foto.jpg", big);
    expect(out.mimeType).toBe("image/webp");
    expect(out.width).toBe(2400);
    expect(out.height).toBe(1200);
  });

  it("rejects SVG and files that lie about their type", async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    await expect(processUpload("logo.svg", svg)).rejects.toBeInstanceOf(MediaError);
    await expect(processUpload("cjenovnik.pdf", Buffer.from("not a pdf"))).rejects.toBeInstanceOf(MediaError);
    const pdf = await processUpload("cjenovnik.pdf", Buffer.from("%PDF-1.7 test"));
    expect(pdf.kind).toBe("document");
  });
});

describe("user management safety", () => {
  const base = { email: null, active: true } as const;

  it("keeps at least one active administrator", async () => {
    const admin = await createUser(db, { ...base, username: "luka", displayName: "Luka", role: "admin", password: "Jaka-Lozinka-2026" }, SYSTEM_ACTOR);
    const editor = await createUser(db, { ...base, username: "urednik", displayName: "Urednik", role: "urednik", password: "Jaka-Lozinka-2026" }, { ...SYSTEM_ACTOR, id: admin.id });

    await expect(updateUser(db, admin.id, { displayName: "Luka", email: null, role: "urednik", active: true }, { ...SYSTEM_ACTOR, id: editor.id })).rejects.toBeInstanceOf(UserError);
    await expect(deleteUser(db, admin.id, { ...SYSTEM_ACTOR, id: editor.id })).rejects.toBeInstanceOf(UserError);
    await expect(deleteUser(db, admin.id, { ...SYSTEM_ACTOR, id: admin.id })).rejects.toThrow(/vlastiti/);
  });

  it("rejects duplicate usernames regardless of case and weak passwords", async () => {
    await createUser(db, { ...base, username: "Luka", displayName: "Luka", role: "admin", password: "Jaka-Lozinka-2026" }, SYSTEM_ACTOR);
    await expect(createUser(db, { ...base, username: "LUKA", displayName: "X", role: "trener", password: "Jaka-Lozinka-2026" }, SYSTEM_ACTOR)).rejects.toThrow(/zauzeto/);
    await expect(createUser(db, { ...base, username: "novi", displayName: "Novi", role: "trener", password: "kratka" }, SYSTEM_ACTOR)).rejects.toThrow(/najmanje/);
  });
});
