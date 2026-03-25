// src/api/ai.api.ts
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export type ApiMessage = {
  id: string | number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
};

type DevAuthParams = {
  devUsername: string;
};

function buildDevAuthHeaders(params: DevAuthParams) {
  const username = params.devUsername.trim();
  if (!username) {
    throw new Error("AI API request requires a backend username for X-Dev-User.");
  }

  return {
    "X-Dev-User": username,
  } as Record<string, string>;
}

export async function createConversation(
  auth: DevAuthParams,
  params?: { context_type?: string; title?: string; linked_subscription?: number; linked_item_valuation?: number }
) {
  const res = await fetch(`${BASE_URL}/api/ai/conversations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildDevAuthHeaders(auth),
    },
    body: JSON.stringify(params ?? {}),
  });

  if (!res.ok) throw new Error(`createConversation failed: ${res.status}`);
  return (await res.json()) as { conversation_id: number };
}

export async function sendMessage(auth: DevAuthParams, conversationId: number, content: string) {
  const res = await fetch(`${BASE_URL}/api/ai/conversations/${conversationId}/messages/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildDevAuthHeaders(auth),
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) throw new Error(`sendMessage failed: ${res.status}`);
  return (await res.json()) as {
    user_message: ApiMessage;
    assistant_message: ApiMessage;
  };
}

export async function listMessages(auth: DevAuthParams, conversationId: number) {
  const res = await fetch(`${BASE_URL}/api/ai/conversations/${conversationId}/messages/`, {
    headers: {
      ...buildDevAuthHeaders(auth),
    },
  });

  if (!res.ok) throw new Error(`listMessages failed: ${res.status}`);
  return (await res.json()) as ApiMessage[];
}
