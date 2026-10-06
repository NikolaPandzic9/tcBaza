import { hash, verify } from "@node-rs/argon2";

/**
 * argon2id with OWASP's recommended minimum (19 MiB, 2 iterations,
 * 1 lane) — strong against GPU cracking while staying well under a
 * serverless function's memory and time budget.
 */
const OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1, outputLen: 32 } as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

/** Precomputed once so a login for an unknown username still spends the
 * same time hashing — response timing can't reveal which usernames exist. */
let dummyHash: Promise<string> | null = null;
export async function burnPasswordCheck(password: string) {
  dummyHash ??= hashPassword("timing-equaliser-not-a-real-password");
  await verifyPassword(await dummyHash, password);
}

export const PASSWORD_MIN_LENGTH = 10;

/** Returns an error message, or null when the password is acceptable. */
export function validatePasswordStrength(password: string, username: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Lozinka mora imati najmanje ${PASSWORD_MIN_LENGTH} znakova.`;
  }
  if (password.length > 200) return "Lozinka je predugačka.";
  if (password.toLowerCase().includes(username.toLowerCase())) {
    return "Lozinka ne smije sadržavati korisničko ime.";
  }
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  if (classes < 3) {
    return "Lozinka mora sadržavati barem tri od: mala slova, velika slova, brojeve, simbole.";
  }
  return null;
}
