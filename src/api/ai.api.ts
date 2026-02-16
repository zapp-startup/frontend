// src/api/ai.api.ts
import { getApiAccessToken } from "@/api/client";
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export type ApiMessage = {
  id: string | number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
};

function parseJwtPayload(token: string) {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded) as Record<string, any>;
  } catch {
    return null;
  }
}

function buildAuthHeaders() {
  const token = getApiAccessToken();
  const payload = token ? parseJwtPayload(token) : null;

  const userIdentifier =
    payload?.email ??
    payload?.user_metadata?.username ??
    payload?.user_metadata?.name ??
    payload?.sub ??
    "anonymous";

  console.log(`[AI API] Sending request as user: ${userIdentifier}`);

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "X-Dev-User": String(userIdentifier),
  } as Record<string, string>;
}

export async function createConversation(params?: { context_type?: string }) {
  const res = await fetch(`${BASE_URL}/api/ai/conversations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // dev-only: identify user without auth CHANGE TO REAL AUTH LATER. DO NOT FORGET.
      ...buildAuthHeaders(),
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
      ...buildAuthHeaders(),
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
      ...buildAuthHeaders(),
    },
  });

  if (!res.ok) throw new Error(`listMessages failed: ${res.status}`);
  return (await res.json()) as ApiMessage[];
}
