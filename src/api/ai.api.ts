// src/api/ai.api.ts
import { getCurrentApiAccessToken } from "@/api/client";
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export type ApiMessage = {
  id: string | number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
  metadata_json?: Record<string, unknown>;
};

export type AiQuickAction = {
  label: string;
  route?: string;
  action_payload?: Record<string, unknown>;
  reason?: string;
};

export type AiAssistantMetadata = {
  action?: string;
  action_status?: string;
  created_transaction_id?: number | null;
  quick_actions?: AiQuickAction[];
  intent_detection?: {
    intent?: string;
    confidence?: number;
  };
};

async function readAiError(res: Response, fallbackMessage: string) {
  const text = (await res.text()).trim();
  if (!text) {
    return `${fallbackMessage}: ${res.status}`;
  }

  try {
    const parsed = JSON.parse(text) as { detail?: string };
    if (typeof parsed.detail === "string" && parsed.detail) {
      return `${fallbackMessage}: ${res.status} ${parsed.detail}`;
    }
  } catch {
    // Use the raw response body below.
  }

  return `${fallbackMessage}: ${res.status} ${text}`;
}

function parseJwtPayload(token: string) {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, any>;
  } catch {
    return null;
  }
}

async function buildAuthHeaders() {
  const token = await getCurrentApiAccessToken();
  if (!token) {
    throw new Error("Authentication required for AI API request, but no Supabase access token is available.");
  }
  const payload = token ? parseJwtPayload(token) : null;

  const userIdentifier =
    payload?.user_metadata?.username ??
    payload?.email ??
    payload?.user_metadata?.name ??
    payload?.sub ??
    "anonymous";

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (import.meta.env.DEV) {
    headers["X-Dev-User"] = String(userIdentifier);
  }

  return headers;
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

  if (!res.ok) throw new Error(await readAiError(res, "createConversation failed"));
  return (await res.json()) as { conversation_id: number };
}

export async function sendMessage(
  conversationId: number,
  content: string,
  actionPayload?: Record<string, unknown>
) {
  const requestBody = actionPayload ? { content, action_payload: actionPayload } : { content };
  const res = await fetch(`${BASE_URL}/api/ai/conversations/${conversationId}/messages/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await buildAuthHeaders()),
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) throw new Error(await readAiError(res, "sendMessage failed"));
  return (await res.json()) as {
    user_message: ApiMessage;
    assistant_message: ApiMessage & { metadata_json?: AiAssistantMetadata };
  };
}

export async function listMessages(conversationId: number) {
  const res = await fetch(`${BASE_URL}/api/ai/conversations/${conversationId}/messages/`, {
    headers: {
      ...(await buildAuthHeaders()),
    },
  });

  if (!res.ok) throw new Error(await readAiError(res, "listMessages failed"));
  return (await res.json()) as ApiMessage[];
}
