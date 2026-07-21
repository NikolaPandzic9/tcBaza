import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { resolveLocale } from "@/i18n/resolveLocale";
import { BUSINESS } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);

  const logoBuffer = await readFile(
    join(process.cwd(), "public/brand/logo-mark-white.png"),
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  const tagline =
    locale === "bs"
      ? "Grupni trening. Individualni rezultat."
      : "Group training. Individual results.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1A3665",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={420} height={238} alt="" />
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 34,
            color: "#A6BE12",
            letterSpacing: 2,
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 24,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {`${BUSINESS.address.city} · ${BUSINESS.address.country}`}
        </div>
      </div>
    ),
    { ...size },
  );
}
