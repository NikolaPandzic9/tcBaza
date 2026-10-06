import type { Metadata } from "next";
import { FilterSelect } from "@/components/erp/client";
import { Pill, type SearchParams } from "@/components/erp/ui";
import { DAYS } from "@/server/content/schemas";
import { getDb } from "@/server/db/client";
import { enrollmentCounts } from "@/server/members/enrollments";
import { ContentListPage, loadOptions } from "../_content/ContentPages";

export const metadata: Metadata = { title: "Termini" };

export default async function TerminiPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const [options, counts] = await Promise.all([loadOptions(), enrollmentCounts(getDb())]);

  return (
    <ContentListPage
      type="termin"
      searchParams={params}
      description="Sedmični raspored grupnih treninga. Slobodna mjesta se računaju iz upisanih članova."
      filters={
        <>
          <FilterSelect param="dayOfWeek" label="Dan" options={DAYS.map((d) => ({ value: d, label: d }))} />
          <FilterSelect param="programKey" label="Program" options={options.programs} />
          <FilterSelect param="trainerId" label="Trener" options={options.trainers} />
          <FilterSelect
            param="active"
            label="Aktivan"
            options={[
              { value: "true", label: "Da" },
              { value: "false", label: "Ne" },
            ]}
          />
        </>
      }
      columns={[
        { label: "Dan i vrijeme", sortKey: "day", render: (d) => `${d.draft.dayOfWeek} ${d.draft.startTime}–${d.draft.endTime}` },
        {
          label: "Program",
          sortKey: "program",
          render: (d) => `${options.programNames.get(d.draft.programKey) ?? d.draft.programKey}${d.draft.group.bs ? ` ${d.draft.group.bs}` : ""}`,
        },
        { label: "Trener", render: (d) => (d.draft.trainerId ? (options.trainerNames.get(d.draft.trainerId) ?? "—") : "—") },
        {
          label: "Popunjenost",
          render: (d) => {
            const taken = counts.get(d.id) ?? 0;
            return (
              <Pill tone={taken >= d.draft.maxParticipants ? "red" : taken > 0 ? "amber" : "green"}>
                {taken}/{d.draft.maxParticipants}
              </Pill>
            );
          },
        },
        {
          label: "Prikaz",
          render: (d) => (d.draft.active ? <Pill tone="navy">{d.draft.status}</Pill> : <Pill tone="gray">Sakriven</Pill>),
        },
      ]}
    />
  );
}
