import type { routing } from "@/i18n/routing";
import type messages from "../messages/bs.json";

// Makes next-intl's own Locale type and useTranslations()/t() key
// checking resolve to our actual locales/messages shape project-wide.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
