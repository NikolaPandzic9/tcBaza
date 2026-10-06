import { beforeEach, describe, expect, it } from "vitest";
import { SYSTEM_ACTOR } from "@/server/audit";
import { createDocument } from "@/server/content/documents";
import type { TerminData } from "@/server/content/schemas";
import type { Database } from "@/server/db/client";
import { CapacityError, enrollMember, enrollmentCounts } from "@/server/members/enrollments";
import { addDaysIso, addMembership, createMember, listMembers, membershipState, updateMember } from "@/server/members/members";
import { resetDatabase } from "./db";

let db: Database;
const actor = SYSTEM_ACTOR;
const person = (firstName: string) => ({
  firstName,
  lastName: "Test",
  phone: null,
  email: null,
  birthDate: null,
  guardianName: null,
  guardianPhone: null,
  note: null,
  active: true,
});

async function termin(max: number) {
  const data: TerminData = {
    programKey: "komercijalna-teretana",
    group: { bs: "", en: "" },
    dayOfWeek: "Srijeda",
    specificDate: null,
    startTime: "10:00",
    endTime: "11:00",
    trainerId: null,
    maxParticipants: max,
    status: "Slobodno",
    note: "",
    colorTag: "Navy",
    displayOrder: 0,
    featured: false,
    active: true,
  };
  return createDocument(db, "termin", data, actor, { publish: true });
}

beforeEach(async () => {
  db = await resetDatabase();
});

describe("membership state", () => {
  const today = "2026-10-06";
  it("classifies by dates relative to today", () => {
    expect(membershipState(null, today)).toBe("bez");
    expect(membershipState({ startDate: "2026-09-01", endDate: "2026-10-05" }, today)).toBe("istekla");
    expect(membershipState({ startDate: "2026-09-10", endDate: "2026-10-13" }, today)).toBe("istice");
    expect(membershipState({ startDate: "2026-09-10", endDate: "2026-10-14" }, today)).toBe("aktivna");
    expect(membershipState({ startDate: "2026-10-07", endDate: "2026-11-06" }, today)).toBe("buduca");
    // The last day still counts as valid (and expiring).
    expect(membershipState({ startDate: "2026-09-06", endDate: today }, today)).toBe("istice");
  });

  it("date math handles month and year ends", () => {
    expect(addDaysIso("2026-12-29", 7)).toBe("2027-01-05");
    expect(addDaysIso("2028-02-28", 1)).toBe("2028-02-29");
  });
});

describe("enrollments", () => {
  it("never exceeds capacity", async () => {
    const t = await termin(2);
    const [a, b, c] = await Promise.all(["Ana", "Bojan", "Cvijeta"].map((n) => createMember(db, person(n), actor)));
    await enrollMember(db, t.id, a.id, actor);
    await enrollMember(db, t.id, b.id, actor);
    await expect(enrollMember(db, t.id, c.id, actor)).rejects.toBeInstanceOf(CapacityError);
    expect((await enrollmentCounts(db)).get(t.id)).toBe(2);
  });

  it("handles concurrent sign-ups for the last spot", async () => {
    const t = await termin(1);
    const members = await Promise.all(["Dino", "Ema", "Faruk"].map((n) => createMember(db, person(n), actor)));
    const results = await Promise.allSettled(members.map((m) => enrollMember(db, t.id, m.id, actor)));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect((await enrollmentCounts(db)).get(t.id)).toBe(1);
  });

  it("inactive members free their spot", async () => {
    const t = await termin(1);
    const m = await createMember(db, person("Goran"), actor);
    await enrollMember(db, t.id, m.id, actor);
    await updateMember(db, m.id, { ...person("Goran"), active: false }, actor);
    expect((await enrollmentCounts(db)).get(t.id) ?? 0).toBe(0);
  });
});

describe("member list filters", () => {
  it("filters by membership state and search", async () => {
    const today = "2026-10-06";
    const expiring = await createMember(db, person("Hana"), actor);
    await addMembership(db, expiring.id, { programKey: "rekreativci", label: "Rekreativci", price: 200, startDate: "2026-09-10", endDate: "2026-10-10", note: null }, actor);
    const active = await createMember(db, person("Ivan"), actor);
    await addMembership(db, active.id, { programKey: "rekreativci", label: "Rekreativci", price: 200, startDate: "2026-10-01", endDate: "2026-10-31", note: null }, actor);
    await createMember(db, person("Jasna"), actor);

    expect((await listMembers(db, { state: "istice" }, today)).items.map((m) => m.firstName)).toEqual(["Hana"]);
    expect((await listMembers(db, { state: "aktivna" }, today)).items.map((m) => m.firstName)).toEqual(["Ivan"]);
    expect((await listMembers(db, { state: "bez" }, today)).items.map((m) => m.firstName)).toEqual(["Jasna"]);
    expect((await listMembers(db, { q: "ivan test" }, today)).total).toBe(1);
  });
});
