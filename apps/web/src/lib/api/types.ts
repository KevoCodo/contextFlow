export type RecordStatus = "draft" | "indexed" | "failed";

export type KnowledgeSource = {
  id: number;
  title: string;
  description: string | null;
  status: RecordStatus;
  created_at: string;
  updated_at: string;
};

export type KnowledgeDocument = {
  id: number;
  source_id: number;
  title: string;
  content: string;
  status: RecordStatus;
  created_at: string;
  updated_at: string;
};

export type KnowledgeChunk = {
  id: number;
  document_id: number;
  chunk_text: string;
  chunk_index: number;
  chunk_metadata: Record<string, unknown> | null;
  has_embedding: boolean;
  created_at: string;
};

export type ListResponse<T> = { items: T[] };

export type AskSession = {
  id: number;
  question: string;
  answer: string | null;
  retrieved_chunks: Record<string, unknown>[] | null;
  created_at: string;
};
