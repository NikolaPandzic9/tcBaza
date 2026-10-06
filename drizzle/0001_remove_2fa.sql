ALTER TABLE "sessions" DROP COLUMN "mfa_pending";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "totp_secret";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "totp_enabled";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "recovery_codes";