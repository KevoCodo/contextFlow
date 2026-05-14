import { createApiClient } from "./client";
import type { RetrieveMatch } from "./retrieve";

export type AskResponse = {
  question: string;
  answer: string;
  matches: RetrieveMatch[];
};

export async function askQuestion(payload: { question: string; top_k?: number }): Promise<AskResponse> {
  return createApiClient().post<AskResponse>("/api/ask", {
    question: payload.question,
    top_k: payload.top_k ?? 5,
  });
}

