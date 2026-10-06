import type { InquiryStatus } from "@/server/inquiries";

export const INQUIRY_TONE: Record<InquiryStatus, "red" | "amber" | "green" | "gray"> = {
  novo: "red",
  u_obradi: "amber",
  rijeseno: "green",
  spam: "gray",
};
