import { beforeEach, describe, expect, it } from "vitest";
import { SYSTEM_ACTOR } from "@/server/audit";
import { defaultHomeFaq, defaultPrograms } from "@/server/content/defaults";
import {
  ConflictError,
  createDocument,
  discardChanges,
  docStatus,
  getDocument,
  listDocuments,
  listPublished,
  listVersions,
  publishDocument,
  restoreVersion,
  saveDraft,
  trashDocument,
} from "@/server/content/documents";
import { terminSchema, type FaqItemData } from "@/server/content/schemas";
import type { Database } from "@/server/db/client";
import { seedContent } from "@/server/seed";
import { resetDatabase } from "./db";

let db: Database;
const actor = SYSTEM_ACTOR;
const faq = (bs: string): FaqItemData => ({ question: { bs, en: "" }, answer: { bs: "Odgovor.", en: "" }, order: 0 });

beforeEach(async () => {
  db = await resetDatabase();
});

describe("draft / publish / versions", () => {
  it("keeps drafts off the site until published", async () => {
    const doc = await createDocument(db, "faqItem", faq("Prvo pitanje?"), actor);
    expect(docStatus(doc)).toBe("draft");
    expect(await listPublished(db, "faqItem")).toHaveLength(0);

    await publishDocument(db, doc.id, actor);
    const live = await listPublished(db, "faqItem");
    expect(live.map((d) => d.data.question.bs)).toEqual(["Prvo pitanje?"]);
  });

  it("edits after publishing stay in the draft until republished", async () => {
    const doc = await createDocument(db, "faqItem", faq("Original?"), actor, { publish: true });
    const { doc: saved } = await saveDraft(db, "faqItem", doc.id, faq("Izmijenjeno?"), actor);
    expect(docStatus(saved)).toBe("changed");
    expect((await listPublished(db, "faqItem"))[0].data.question.bs).toBe("Original?");

    await publishDocument(db, doc.id, actor);
    expect((await listPublished(db, "faqItem"))[0].data.question.bs).toBe("Izmijenjeno?");
  });

  it("refuses to overwrite someone else's newer save", async () => {
    const doc = await createDocument(db, "faqItem", faq("A?"), actor);
    await saveDraft(db, "faqItem", doc.id, faq("B?"), actor, { expectedVersion: 1 });
    await expect(saveDraft(db, "faqItem", doc.id, faq("C?"), actor, { expectedVersion: 1 })).rejects.toBeInstanceOf(ConflictError);
  });

  it("does not create a version when nothing changed", async () => {
    const doc = await createDocument(db, "faqItem", faq("Isto?"), actor);
    const result = await saveDraft(db, "faqItem", doc.id, faq("Isto?"), actor);
    expect(result.changed).toBe(false);
    expect(result.doc.version).toBe(1);
  });

  it("restores an older version into the draft and can discard back to live", async () => {
    const doc = await createDocument(db, "faqItem", faq("v1?"), actor, { publish: true });
    await saveDraft(db, "faqItem", doc.id, faq("v2?"), actor);
    const versions = await listVersions(db, doc.id);
    const first = versions.find((v) => v.version === 1)!;

    await restoreVersion(db, doc.id, first.id, actor);
    let current = await getDocument(db, "faqItem", doc.id);
    expect(current!.draft.question.bs).toBe("v1?");
    expect(current!.version).toBe(3);

    await saveDraft(db, "faqItem", doc.id, faq("v4?"), actor);
    await discardChanges(db, doc.id, actor);
    current = await getDocument(db, "faqItem", doc.id);
    expect(current!.draft.question.bs).toBe("v1?");
    expect(docStatus(current!)).toBe("published");
  });

  it("trash removes a document from the site and from normal lists", async () => {
    const doc = await createDocument(db, "faqItem", faq("Brisanje?"), actor, { publish: true });
    await trashDocument(db, doc.id, actor);
    expect(await listPublished(db, "faqItem")).toHaveLength(0);
    expect((await listDocuments(db, "faqItem")).total).toBe(0);
    expect((await listDocuments(db, "faqItem", { trash: true })).total).toBe(1);
  });

  it("search treats % and _ literally", async () => {
    await createDocument(db, "faqItem", faq("Popust 50% za članove?"), actor);
    await createDocument(db, "faqItem", faq("Bez popusta?"), actor);
    expect((await listDocuments(db, "faqItem", { q: "50%" })).total).toBe(1);
    expect((await listDocuments(db, "faqItem", { q: "%" })).total).toBe(1);
  });
});

describe("termin validation (ported from the Sanity schema)", () => {
  const base = {
    programKey: "rekreativci",
    dayOfWeek: "Ponedjeljak",
    startTime: "18:00",
    endTime: "19:00",
    trainerId: "8b7c5c1e-0000-4000-8000-000000000000",
    maxParticipants: 5,
  };

  it("requires the end time after the start time", () => {
    const result = terminSchema.safeParse({ ...base, endTime: "17:30" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["endTime"]);
  });

  it("requires a trainer for group sessions but not for the open gym", () => {
    expect(terminSchema.safeParse({ ...base, trainerId: null }).success).toBe(false);
    expect(terminSchema.safeParse({ ...base, trainerId: null, programKey: "komercijalna-teretana" }).success).toBe(true);
  });

  it("rejects malformed times", () => {
    expect(terminSchema.safeParse({ ...base, startTime: "25:00" }).success).toBe(false);
  });
});

describe("seed", () => {
  it("imports today's site content once, as published", async () => {
    expect(await seedContent(db, () => {})).toBe(true);
    expect(await seedContent(db, () => {})).toBe(false);

    const programs = await listPublished(db, "program");
    expect(programs.map((p) => p.key).sort()).toEqual(defaultPrograms().map((p) => p.key).sort());
    const pasos = programs.find((p) => p.key === "sportski-pasos")!;
    expect(pasos.data.tiers[0].price).toBe(80);
    expect(await listPublished(db, "faqItem")).toHaveLength(defaultHomeFaq().length);
    expect(await listPublished(db, "siteSettings")).toHaveLength(1);
  });
});
