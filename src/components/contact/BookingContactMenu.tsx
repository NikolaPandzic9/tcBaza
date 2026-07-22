"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarCheck, ChevronRight, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/i18n/routing";
import { BUSINESS, WHATSAPP_NUMBER } from "@/lib/constants";
import {
  buttonBaseClasses,
  buttonVariantClasses,
  type ButtonVariant,
} from "@/components/ui/buttonStyles";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/cn";

interface BookingContactMenuProps {
  locale: Locale;
  variant?: ButtonVariant;
  className?: string;
}

const WHATSAPP_PREFILL = {
  bs: "Zanima me termin za: ",
  en: "I'm interested in a session for: ",
};

// Booking still runs through phone/message rather than an online system
// (see HANDOVER.md) — this replaces a single bare "Pozovi" link with a
// small menu of the three real channels the client actually monitors,
// each opening with useful context prefilled where the platform allows it.
//
// The panel renders through a portal into document.body: several call
// sites place this button inside a clip-corner/clip-corner-lg card, and
// clip-path on an ancestor clips descendants' painted content — including
// absolutely positioned ones — so an in-flow dropdown would get cut off
// at the card's edge. Portaling (with a fixed-position, viewport-measured
// panel) sidesteps that entirely.
export function BookingContactMenu({
  locale,
  variant = "secondary",
  className,
}: BookingContactMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function handleScrollOrResize() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open]);

  const toggleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const panelWidth = 320;
      setPosition({
        top: rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - panelWidth - 12),
        width: panelWidth,
      });
    }
    setOpen((current) => !current);
  };

  const t = {
    trigger: locale === "bs" ? "Zakaži termin" : "Book a session",
    whatsapp: "WhatsApp",
    whatsappHint:
      locale === "bs" ? "Piši odmah, uz predložen tekst" : "Message us, with a suggested prompt",
    instagram: "Instagram",
    instagramHint: locale === "bs" ? "Otvori profil i pošalji poruku" : "Open the profile and send a DM",
    call: locale === "bs" ? "Pozovi" : "Call",
    callHint: BUSINESS.phone,
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_PREFILL[locale])}`;

  const options = [
    {
      key: "whatsapp",
      href: whatsappUrl,
      icon: <WhatsAppIcon className="size-5 shrink-0 text-[#25D366]" />,
      label: t.whatsapp,
      hint: t.whatsappHint,
      external: true,
    },
    {
      key: "instagram",
      href: BUSINESS.instagramUrl,
      icon: <InstagramIcon className="size-5 shrink-0 text-navy-700" aria-hidden />,
      label: t.instagram,
      hint: t.instagramHint,
      external: true,
    },
    {
      key: "call",
      href: BUSINESS.phoneHref,
      icon: <Phone className="size-5 shrink-0 text-navy-700" aria-hidden />,
      label: t.call,
      hint: t.callHint,
      external: false,
    },
  ];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(buttonBaseClasses, buttonVariantClasses[variant], className)}
      >
        <CalendarCheck className="size-4" aria-hidden />
        {t.trigger}
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={panelRef}
                role="menu"
                initial={reducedMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
                animate={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{ top: position.top, left: position.left, width: position.width }}
                className="fixed z-[60] clip-corner-lg bg-white p-2 shadow-lg ring-1 ring-charcoal-200"
              >
                {options.map((option) => (
                  <a
                    key={option.key}
                    role="menuitem"
                    href={option.href}
                    target={option.external ? "_blank" : undefined}
                    rel={option.external ? "noopener noreferrer" : undefined}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 p-3 transition-colors hover:bg-navy-50"
                  >
                    {option.icon}
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-navy-900">
                        {option.label}
                      </span>
                      <span className="block text-xs text-charcoal-500">{option.hint}</span>
                    </span>
                    <ChevronRight
                      className="size-4 shrink-0 text-charcoal-300 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
