import { CheckCircle2, Clock, MinusCircle, XCircle } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { TerminStatus } from "@/sanity/types";

const STATUS_CONFIG: Record<
  TerminStatus,
  { tone: BadgeTone; icon: typeof CheckCircle2; label: { bs: string; en: string } }
> = {
  Slobodno: { tone: "free", icon: CheckCircle2, label: { bs: "Slobodno", en: "Open" } },
  Popunjeno: { tone: "full", icon: XCircle, label: { bs: "Popunjeno", en: "Full" } },
  Otkazano: {
    tone: "cancelled",
    icon: MinusCircle,
    label: { bs: "Otkazano", en: "Cancelled" },
  },
  Uskoro: { tone: "soon", icon: Clock, label: { bs: "Uskoro", en: "Coming soon" } },
};

interface StatusBadgeProps {
  status: TerminStatus;
  locale: "bs" | "en";
}

// Status is always paired with an icon, never color alone (WCAG 1.4.1).
export function StatusBadge({ status, locale }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge tone={config.tone}>
      <Icon className="size-3.5" aria-hidden />
      {config.label[locale]}
    </Badge>
  );
}
