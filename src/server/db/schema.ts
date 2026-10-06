import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Users, sessions, security                                           */
/* ------------------------------------------------------------------ */

export const userRole = pgEnum("user_role", ["admin", "urednik", "trener"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: text("username").notNull(),
    /** Lower-cased copy used for lookups, so "Luka" and "luka" are one account. */
    usernameKey: text("username_key").notNull(),
    displayName: text("display_name").notNull(),
    email: text("email"),
    role: userRole("role").notNull().default("urednik"),
    passwordHash: text("password_hash").notNull(),
    active: boolean("active").notNull().default(true),
    passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_username_key_idx").on(t.usernameKey)],
);

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 of the cookie token — a leaked DB row can't be replayed. */
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    usernameKey: text("username_key").notNull(),
    ip: text("ip").notNull(),
    success: boolean("success").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("login_attempts_user_idx").on(t.usernameKey, t.createdAt),
    index("login_attempts_ip_idx").on(t.ip, t.createdAt),
  ],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    /** Kept even if the user is later deleted. */
    username: text("username"),
    action: text("action").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    summary: text("summary").notNull(),
    details: jsonb("details").$type<Record<string, unknown>>(),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_created_idx").on(t.createdAt),
    index("audit_entity_idx").on(t.entityType, t.entityId),
    index("audit_user_idx").on(t.userId),
  ],
);

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

export const mediaKind = pgEnum("media_kind", ["image", "document"]);

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: mediaKind("kind").notNull(),
    /** "static:<path>" for files shipped in /public, "blob:<key>" or
     * "local:<key>" for uploads. */
    storageKey: text("storage_key").notNull(),
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    width: integer("width"),
    height: integer("height"),
    alt: jsonb("alt").$type<{ bs: string; en: string }>().notNull().default({ bs: "", en: "" }),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("media_created_idx").on(t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* Publishable content (draft / published / versions)                  */
/* ------------------------------------------------------------------ */

export const contentDocuments = pgTable(
  "content_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(),
    /** Stable identifier for documents code depends on (program slugs,
     * the settings singleton). Null for free-form documents. */
    key: text("key"),
    draft: jsonb("draft").$type<Record<string, unknown>>().notNull(),
    published: jsonb("published").$type<Record<string, unknown>>(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    /** Version number of the draft — bumped on every save. */
    version: integer("version").notNull().default(1),
    publishedVersion: integer("published_version"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    /** Soft delete: lands in the trash, restorable. */
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("content_type_idx").on(t.type, t.deletedAt),
    uniqueIndex("content_type_key_idx")
      .on(t.type, t.key)
      .where(sql`${t.key} is not null`),
  ],
);

export const contentVersions = pgTable(
  "content_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => contentDocuments.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    event: text("event").notNull(),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("content_versions_doc_idx").on(t.documentId, t.version)],
);

/* ------------------------------------------------------------------ */
/* Members, memberships, payments, enrollments                         */
/* ------------------------------------------------------------------ */

export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone"),
    email: text("email"),
    birthDate: date("birth_date"),
    /** Parent/guardian — for kids' programs. */
    guardianName: text("guardian_name"),
    guardianPhone: text("guardian_phone"),
    note: text("note"),
    active: boolean("active").notNull().default(true),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("members_name_idx").on(t.lastName, t.firstName)],
);

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    programKey: text("program_key").notNull(),
    /** Snapshot of the tier label at sign-up, so later price-list edits
     * don't rewrite history. */
    label: text("label").notNull(),
    price: numeric("price", { precision: 10, scale: 2, mode: "number" }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    note: text("note"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("memberships_member_idx").on(t.memberId),
    index("memberships_end_idx").on(t.endDate),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    membershipId: uuid("membership_id").references(() => memberships.id, { onDelete: "set null" }),
    amount: numeric("amount", { precision: 10, scale: 2, mode: "number" }).notNull(),
    paidAt: date("paid_at").notNull(),
    method: text("method").notNull(),
    note: text("note"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("payments_member_idx").on(t.memberId),
    index("payments_paid_idx").on(t.paidAt),
  ],
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    terminId: uuid("termin_id")
      .notNull()
      .references(() => contentDocuments.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("enrollments_unique_idx").on(t.terminId, t.memberId)],
);

/* ------------------------------------------------------------------ */
/* Inquiries (contact form)                                            */
/* ------------------------------------------------------------------ */

export const inquiryStatus = pgEnum("inquiry_status", ["novo", "u_obradi", "rijeseno", "spam"]);

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    message: text("message").notNull(),
    locale: text("locale").notNull(),
    status: inquiryStatus("status").notNull().default("novo"),
    internalNote: text("internal_note"),
    emailSent: boolean("email_sent").notNull().default(false),
    handledBy: uuid("handled_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("inquiries_status_idx").on(t.status, t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* App metadata (seed markers etc.)                                    */
/* ------------------------------------------------------------------ */

export const appMeta = pgTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type UserRole = (typeof userRole.enumValues)[number];
export type ContentDocument = typeof contentDocuments.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
