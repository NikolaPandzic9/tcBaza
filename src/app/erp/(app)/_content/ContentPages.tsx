import { Archive, ArchiveRestore, EyeOff, History, Plus, RotateCcw, Send, Undo2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ConfirmSubmit, FilterSelect, SearchInput, SubmitButton } from "@/components/erp/client";
import {
  Alert,
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  Pill,
  SortHeader,
  buttonClass,
  formatDateTime,
  param,
  table,
  type SearchParams,
} from "@/components/erp/ui";
import type { MediaItem } from "@/app/erp/(app)/mediji/actions";
import { requireUser } from "@/server/auth/current";
import { can } from "@/server/auth/permissions";
import {
  docStatus,
  getDocument,
  listDocuments,
  listDrafts,
  listVersions,
  type DocStatus,
  type TypedDocument,
} from "@/server/content/documents";
import { deepEqual } from "@/server/content/equal";
import { CONTENT_META } from "@/server/content/registry";
import type { ContentType } from "@/server/content/schemas";
import { getDb } from "@/server/db/client";
import { getMediaByIds } from "@/server/media/media";
import {
  discardAction,
  publishAction,
  purgeAction,
  restoreVersionAction,
  trashAction,
  unpublishAction,
  untrashAction,
} from "./actions";
import { CONTENT_ROUTES, STATUS_LABELS, VERSION_EVENT_LABELS, contentPermission } from "./config";
import { DocumentEditor } from "./DocumentEditor";
import { EDITOR_SECTIONS, NEW_DOCUMENT, type FieldDef, type Option } from "./fields";

export function StatusPill({ status }: { status: DocStatus }) {
  const s = STATUS_LABELS[status];
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

/* ------------------------------------------------------------------ */
/* Lookups shared by list + edit views                                 */
/* ------------------------------------------------------------------ */

export async function loadOptions(): Promise<{ programs: Option[]; trainers: Option[]; programNames: Map<string, string>; trainerNames: Map<string, string> }> {
  const db = getDb();
  const [programs, team] = await Promise.all([listDrafts(db, "program"), listDrafts(db, "teamMember")]);
  const sortedPrograms = programs
    .filter((p) => p.key)
    .sort((a, b) => a.data.order - b.data.order)
    .map((p) => ({ value: p.key!, label: p.data.name.bs }));
  const trainers = team
    .filter((t) => t.data.leadsSessions)
    .sort((a, b) => a.data.order - b.data.order)
    .map((t) => ({ value: t.id, label: t.data.name }));
  return {
    programs: sortedPrograms,
    trainers,
    programNames: new Map(sortedPrograms.map((p) => [p.value, p.label])),
    trainerNames: new Map(team.map((t) => [t.id, t.data.name])),
  };
}

function collectMediaIds(value: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach((v) => collectMediaIds(v, out));
  else if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) {
      if (/(imageId|photoId|logoId)$/.test(key) && typeof v === "string") out.add(v);
      else collectMediaIds(v, out);
    }
  }
  return out;
}

async function mediaPreviews(data: unknown): Promise<Record<string, MediaItem>> {
  const map = await getMediaByIds(getDb(), [...collectMediaIds(data)]);
  return Object.fromEntries(
    [...map.values()].map((m) => [
      m.id,
      { id: m.id, url: m.url, filename: m.filename, kind: m.kind, alt: m.alt, width: m.width, height: m.height, size: m.size },
    ]),
  );
}

function fieldLabels(type: ContentType): Map<string, string> {
  const labels = new Map<string, string>();
  for (const section of EDITOR_SECTIONS[type]) {
    for (const field of section.fields as FieldDef[]) labels.set(field.name, field.label);
  }
  return labels;
}

/* ------------------------------------------------------------------ */
/* List                                                                */
/* ------------------------------------------------------------------ */

export interface Column<T extends ContentType> {
  label: string;
  sortKey?: string;
  className?: string;
  render: (doc: TypedDocument<T>) => ReactNode;
}

export async function ContentListPage<T extends ContentType>({
  type,
  searchParams,
  columns,
  filters,
  description,
}: {
  type: T;
  searchParams: SearchParams;
  columns: Column<T>[];
  filters?: ReactNode;
  description?: string;
}) {
  const { user } = await requireUser(contentPermission(type, "view"));
  const meta = CONTENT_META[type];
  const basePath = CONTENT_ROUTES[type];
  const trash = param(searchParams, "trash") === "1";
  const status = param(searchParams, "status") as DocStatus | undefined;

  const result = await listDocuments(getDb(), type, {
    q: param(searchParams, "q"),
    sort: param(searchParams, "sort"),
    dir: param(searchParams, "dir") === "desc" ? "desc" : "asc",
    page: Number(param(searchParams, "page") ?? 1) || 1,
    status,
    trash,
    filters: Object.fromEntries(meta.filterFields.map((f) => [f, param(searchParams, f)])),
  });

  const canCreate = meta.creatable && can(user.role, contentPermission(type, "edit"));

  return (
    <>
      <PageHeader
        title={trash ? `${meta.plural} — otpad` : meta.plural}
        description={description}
        actions={
          <>
            {meta.creatable && (
              <Link href={trash ? basePath : `${basePath}?trash=1`} className={buttonClass("ghost", "sm")}>
                {trash ? <Undo2 className="size-4" aria-hidden /> : <Archive className="size-4" aria-hidden />}
                {trash ? "Nazad na listu" : "Otpad"}
              </Link>
            )}
            {canCreate && !trash && (
              <Link href={`${basePath}/novi`} className={buttonClass("accent")}>
                <Plus className="size-4" aria-hidden />
                Novi: {meta.label.toLowerCase()}
              </Link>
            )}
          </>
        }
      />

      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-charcoal-100 px-4 py-3">
          <SearchInput />
          <FilterSelect
            param="status"
            label="Status"
            options={[
              { value: "published", label: "Objavljeno" },
              { value: "changed", label: "Neobjavljene izmjene" },
              { value: "draft", label: "Nacrt" },
            ]}
          />
          {filters}
        </div>

        {result.items.length === 0 ? (
          <EmptyState title={trash ? "Otpad je prazan" : "Nema rezultata"}>
            {param(searchParams, "q") || status ? "Promijeni pretragu ili filtere." : canCreate && !trash ? "Dodaj prvi zapis dugmetom iznad." : null}
          </EmptyState>
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  {columns.map((col) =>
                    col.sortKey ? (
                      <SortHeader
                        key={col.label}
                        label={col.label}
                        field={col.sortKey}
                        basePath={basePath}
                        params={searchParams}
                        current={result.sort}
                        dir={result.dir}
                      />
                    ) : (
                      <th key={col.label} className={table.th}>
                        {col.label}
                      </th>
                    ),
                  )}
                  <th className={table.th}>Status</th>
                  <SortHeader label="Izmijenjeno" field="updated" basePath={basePath} params={searchParams} current={result.sort} dir={result.dir} />
                </tr>
              </thead>
              <tbody>
                {result.items.map((doc) => (
                  <tr key={doc.id} className={table.row}>
                    {columns.map((col, i) => (
                      <td key={col.label} className={`${table.td} ${col.className ?? ""}`}>
                        {i === 0 ? (
                          <Link href={`${basePath}/${doc.id}`} className="font-semibold text-navy-900 hover:underline">
                            {col.render(doc)}
                          </Link>
                        ) : (
                          col.render(doc)
                        )}
                      </td>
                    ))}
                    <td className={table.td}>
                      <StatusPill status={docStatus(doc)} />
                    </td>
                    <td className={`${table.td} whitespace-nowrap text-xs text-charcoal-500`}>{formatDateTime(doc.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination basePath={basePath} params={searchParams} page={result.page} pageCount={result.pageCount} total={result.total} />
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Edit / create                                                       */
/* ------------------------------------------------------------------ */

export async function ContentEditPage<T extends ContentType>({
  type,
  id,
  title,
  aside,
  below,
}: {
  type: T;
  id: string | null;
  title?: string;
  aside?: ReactNode;
  below?: ReactNode;
}) {
  const { user } = await requireUser(contentPermission(type, id ? "view" : "edit"));
  const db = getDb();
  const meta = CONTENT_META[type];
  const basePath = CONTENT_ROUTES[type];

  const doc = id ? await getDocument(db, type, id) : null;
  if (id && !doc) notFound();
  if (!id && !meta.creatable) notFound();

  const data = (doc?.draft ?? NEW_DOCUMENT[type]?.()) as Record<string, unknown>;
  const [options, previews, versions] = await Promise.all([
    loadOptions(),
    mediaPreviews(data),
    doc ? listVersions(db, doc.id) : Promise.resolve([]),
  ]);

  const canEdit = can(user.role, contentPermission(type, "edit"));
  const canPublish = can(user.role, contentPermission(type, "publish"));
  const canDelete = meta.creatable && can(user.role, contentPermission(type, "delete"));
  const status = doc ? docStatus(doc) : null;
  const labels = fieldLabels(type);
  const heading = title ?? (doc ? meta.title(doc.draft) : `Novi: ${meta.label.toLowerCase()}`);

  return (
    <>
      <PageHeader
        title={heading}
        back={meta.singleton ? undefined : { href: basePath, label: meta.plural }}
        actions={status && <StatusPill status={status} />}
      />

      {doc?.deletedAt && (
        <Alert tone="warning" className="mb-5">
          Ovaj zapis je u otpadu i ne prikazuje se na sajtu.
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {canEdit && !doc?.deletedAt ? (
            <DocumentEditor
              type={type}
              id={doc?.id ?? null}
              initialData={data}
              version={doc?.version ?? 1}
              basePath={basePath}
              options={{ programs: options.programs, trainers: options.trainers }}
              mediaPreviews={previews}
              canPublish={canPublish}
            />
          ) : (
            <Alert tone="info">Imaš pristup samo za pregled ovog zapisa.</Alert>
          )}
          {below}
        </div>

        {doc && (
          <aside className="space-y-6">
            <Card title="Objava">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-charcoal-500">Status</dt>
                  <dd>{status && <StatusPill status={status} />}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-charcoal-500">Objavljeno</dt>
                  <dd className="text-right">{formatDateTime(doc.publishedAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-charcoal-500">Zadnja izmjena</dt>
                  <dd className="text-right">{formatDateTime(doc.updatedAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-charcoal-500">Verzija nacrta</dt>
                  <dd>
                    {doc.version}
                    {doc.publishedVersion ? ` (na sajtu: ${doc.publishedVersion})` : ""}
                  </dd>
                </div>
              </dl>

              {!doc.deletedAt && (
                <div className="mt-5 flex flex-col gap-2">
                  {canPublish && status !== "published" && (
                    <form action={publishAction.bind(null, type, doc.id)}>
                      <SubmitButton variant="accent" className="w-full" pendingLabel="Objavljujem…">
                        <Send className="size-4" aria-hidden />
                        Objavi nacrt
                      </SubmitButton>
                    </form>
                  )}
                  {canEdit && status === "changed" && (
                    <form action={discardAction.bind(null, type, doc.id)}>
                      <ConfirmSubmit message="Odbaciti neobjavljene izmjene i vratiti nacrt na verziju sa sajta?" variant="ghost" size="md" className="w-full">
                        <RotateCcw className="size-4" aria-hidden />
                        Odbaci izmjene
                      </ConfirmSubmit>
                    </form>
                  )}
                  {canPublish && !meta.singleton && doc.published && (
                    <form action={unpublishAction.bind(null, type, doc.id)}>
                      <ConfirmSubmit message="Povući s objave? Zapis više neće biti vidljiv na sajtu." variant="ghost" size="md" className="w-full">
                        <EyeOff className="size-4" aria-hidden />
                        Povuci s objave
                      </ConfirmSubmit>
                    </form>
                  )}
                  {canDelete && (
                    <form action={trashAction.bind(null, type, doc.id)}>
                      <ConfirmSubmit message="Premjestiti u otpad? Zapis nestaje sa sajta, ali se može vratiti." size="md" className="w-full">
                        <Archive className="size-4" aria-hidden />
                        Premjesti u otpad
                      </ConfirmSubmit>
                    </form>
                  )}
                </div>
              )}

              {doc.deletedAt && canDelete && (
                <div className="mt-5 flex flex-col gap-2">
                  <form action={untrashAction.bind(null, type, doc.id)}>
                    <SubmitButton variant="primary" className="w-full">
                      <ArchiveRestore className="size-4" aria-hidden />
                      Vrati iz otpada
                    </SubmitButton>
                  </form>
                  {can(user.role, "content.purge") && (
                    <form action={purgeAction.bind(null, type, doc.id)}>
                      <ConfirmSubmit message="Trajno obrisati? Ovo se ne može poništiti — briše se i historija verzija." size="md" className="w-full">
                        Trajno obriši
                      </ConfirmSubmit>
                    </form>
                  )}
                </div>
              )}
            </Card>

            {aside}

            <Card title={<span className="inline-flex items-center gap-2"><History className="size-4" aria-hidden /> Historija</span>} padded={false}>
              <ol className="max-h-[28rem] divide-y divide-charcoal-100 overflow-y-auto">
                {versions.map((v, index) => {
                  const previous = versions[index + 1];
                  const changed =
                    previous && v.event !== "publish"
                      ? Object.keys(v.data).filter((k) => !deepEqual(v.data[k], previous.data[k]))
                      : [];
                  const isCurrent = v.version === doc.version && deepEqual(v.data, doc.draft);
                  return (
                    <li key={v.id} className="px-5 py-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-navy-900">
                            {VERSION_EVENT_LABELS[v.event] ?? v.event} · v{v.version}
                          </p>
                          <p className="text-xs text-charcoal-500">
                            {formatDateTime(v.createdAt)} · {v.username ?? "sistem"}
                          </p>
                          {changed.length > 0 && (
                            <p className="mt-1 text-xs text-charcoal-500">
                              Izmjene: {changed.map((k) => labels.get(k) ?? k).join(", ")}
                            </p>
                          )}
                        </div>
                        {canEdit && !isCurrent && !doc.deletedAt && (
                          <form action={restoreVersionAction.bind(null, type, doc.id, v.id)}>
                            <ConfirmSubmit message={`Vratiti verziju ${v.version} u nacrt? Trenutni nacrt ostaje u historiji.`} variant="ghost">
                              Vrati
                            </ConfirmSubmit>
                          </form>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>
          </aside>
        )}
      </div>
    </>
  );
}
