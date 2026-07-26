import { createApiClient } from "./client";
import type { RetrieveMatch } from "./retrieve";

export type AskResponse = {
  question: string;
  answer: string | null;
  answer_status?: "retrieval_only" | "supported" | "insufficient_context" | null;
  answer_sources?: number[];
  source_id?: number | null;
  top_k: number;
  retrieval_only: boolean;
  matches: RetrieveMatch[];
};

export async function askQuestion(payload: {
  question: string;
  top_k?: number;
  source_id?: number;
  retrieval_only?: boolean;
}): Promise<AskResponse> {
  return createApiClient().post<AskResponse>("/api/ask", {
    question: payload.question,
    top_k: payload.top_k ?? 5,
    source_id: payload.source_id,
    retrieval_only: payload.retrieval_only ?? false,
  });
}
