import type { PillTone } from "@/components/erp/ui";
import type { MembershipState } from "@/server/members/members";

export const MEMBERSHIP_STATE: Record<MembershipState, { label: string; tone: PillTone }> = {
  aktivna: { label: "Aktivna", tone: "green" },
  istice: { label: "Ističe uskoro", tone: "amber" },
  istekla: { label: "Istekla", tone: "red" },
  buduca: { label: "Počinje uskoro", tone: "navy" },
  bez: { label: "Bez članarine", tone: "gray" },
};
