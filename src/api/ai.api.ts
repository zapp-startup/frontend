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
  params?: {
    context_type?: string;
    title?: string;
    linked_subscription?: number;
    linked_item_valuation?: number;
  }
) {
  const res = await fetch(`${BASE_URL}/api/ai/conversations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildDevAuthHeaders(auth),
    },
    body: JSON.stringify(params ?? {}),
  });

  if (!res.ok) {
    throw new Error(await readAiError(res, "createConversation failed"));
  }

  return (await res.json()) as { conversation_id: number };
}

export async function sendMessage(
  auth: DevAuthParams,
  conversationId: number,
  content: string,
  actionPayload?: Record<string, unknown>
) {
  const requestBody = actionPayload
    ? { content, action_payload: actionPayload }
    : { content };

  const res = await fetch(`${BASE_URL}/api/ai/conversations/${conversationId}/messages/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildDevAuthHeaders(auth),
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    throw new Error(await readAiError(res, "sendMessage failed"));
  }

  return (await res.json()) as {
    user_message: ApiMessage;
    assistant_message: ApiMessage & { metadata_json?: AiAssistantMetadata };
  };
}

export async function listMessages(auth: DevAuthParams, conversationId: number) {
  const res = await fetch(`${BASE_URL}/api/ai/conversations/${conversationId}/messages/`, {
    headers: {
      ...buildDevAuthHeaders(auth),
    },
  });

  if (!res.ok) {
    throw new Error(await readAiError(res, "listMessages failed"));
  }

  return (await res.json()) as ApiMessage[];
}