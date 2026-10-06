/**
 * CSV for Excel in the Bosnian locale: semicolon separator, UTF-8 BOM (so
 * č/ć/š/đ/ž open correctly), and cells that start with = + - @ prefixed
 * with ' — otherwise a member named "=HYPERLINK(...)" becomes a live
 * formula in whoever opens the export (CSV injection).
 */
function cell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[;"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const BOM = String.fromCharCode(0xfeff);

export function toCsv(header: string[], rows: unknown[][]): string {
  return BOM + [header, ...rows].map((row) => row.map(cell).join(";")).join("\r\n");
}

export function csvResponse(filename: string, body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
