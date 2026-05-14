import { NewDocumentForm } from "@/components/documents/new-document-form";
import type { KnowledgeSource } from "@/lib/api/types";
import { serverGet } from "@/lib/api/server";

async function fetchSources(): Promise<KnowledgeSource[]> {
  const res = await serverGet<{ items: KnowledgeSource[] }>("/api/sources");
  return res.items;
}

export default async function NewDocumentPage({
  searchParams,
}: {
  searchParams: Promise<{ source_id?: string }>;
}) {
  const { source_id } = await searchParams;
  const preselectedSourceId = source_id ? Number(source_id) : undefined;
  const sources = await fetchSources();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">New document</h1>
        <p className="text-sm text-[var(--muted)]">
          Manual text entry is the MVP ingestion method. Paste public-safe content only.
        </p>
      </header>

      <NewDocumentForm
        sources={sources}
        preselectedSourceId={
          preselectedSourceId && Number.isFinite(preselectedSourceId)
            ? preselectedSourceId
            : undefined
        }
      />
    </div>
  );
}
