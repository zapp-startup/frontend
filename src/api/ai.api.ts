// src/api/ai.api.ts
import { getCurrentApiAccessToken } from "@/api/client";
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export type ApiMessage = {
  id: string | number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
};

async function buildAuthHeaders() {
  const token = await getCurrentApiAccessToken();
  if (!token) {
    throw new Error("Authentication required for AI API request, but no Supabase access token is available.");
  }

  return {
    Authorization: `Bearer ${token}`,
  } as Record<string, string>;
}

export async function createConversation(params?: { context_type?: string }) {
  const res = await fetch(`${BASE_URL}/api/ai/conversations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await buildAuthHeaders()),
    },
    body: JSON.stringify(params ?? {}),
  });

  if (!res.ok) throw new Error(`createConversation failed: ${res.status}`);
  return (await res.json()) as { conversation_id: number };
}

export async function sendMessage(conversationId: number, content: string) {
  const res = await fetch(`${BASE_URL}/api/ai/conversations/${conversationId}/messages/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await buildAuthHeaders()),
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) throw new Error(`sendMessage failed: ${res.status}`);
  return (await res.json()) as {
    user_message: ApiMessage;
    assistant_message: ApiMessage;
  };
}

export async function listMessages(conversationId: number) {
  const res = await fetch(`${BASE_URL}/api/ai/conversations/${conversationId}/messages/`, {
    headers: {
      ...(await buildAuthHeaders()),
    },
  });

  if (!res.ok) throw new Error(`listMessages failed: ${res.status}`);
  return (await res.json()) as ApiMessage[];
}
