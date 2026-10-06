/** Escapes LIKE/ILIKE wildcards so user search text is matched literally. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}
