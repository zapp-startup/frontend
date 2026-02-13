// src/api/ai.api.ts
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export type ApiMessage = {
  id: string | number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
};

export async function createConversation(params?: { context_type?: string }) {
  const res = await fetch(`${BASE_URL}/api/ai/conversations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // dev-only: identify user without auth CHANGE TO REAL AUTH LATER. DO NOT FORGET.
      "X-Dev-User": "seed_user_0",
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
      "X-Dev-User": "seed_user_0",
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
      "X-Dev-User": "seed_user_0",
    },
  });

  if (!res.ok) throw new Error(`listMessages failed: ${res.status}`);
  return (await res.json()) as ApiMessage[];
}
