import { getValidatedUrlOrThrow, resolveApiBaseUrl } from "@/config/apiEnv";
import { getApiAccessToken } from "./client";

const apiEnvResult = resolveApiBaseUrl();

function getAiBaseUrl(): string {
  return getValidatedUrlOrThrow(apiEnvResult);
}

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
  devUsername?: string;
};

type CreateConversationParams = {
  context_type?: string;
  title?: string;
  linked_subscription?: number;
  linked_item_valuation?: number;
};

function parseJwtPayload(token: string) {
  const [, encodedPayload] = token.split(".");
  if (!encodedPayload) return null;

  const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

  try {
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readUsernameFromToken(token: string | null) {
  if (!token) return null;

  const payload = parseJwtPayload(token);
  if (!payload) return null;

  const fromPayload = payload.username;
  if (typeof fromPayload === "string" && fromPayload.trim()) {
    return fromPayload.trim();
  }

  const metadata = payload.user_metadata;
  if (!metadata || typeof metadata !== "object") return null;

  const fromMetadata = (metadata as Record<string, unknown>).username;
  if (typeof fromMetadata === "string" && fromMetadata.trim()) {
    return fromMetadata.trim();
  }

  return null;
}

function resolveDevUsername(auth?: DevAuthParams) {
  const explicitUsername = auth?.devUsername?.trim();
  if (explicitUsername) {
    return explicitUsername;
  }

  return readUsernameFromToken(getApiAccessToken());
}

function buildAiHeaders(auth?: DevAuthParams, body?: BodyInit | null) {
  const headers: Record<string, string> = {};
  const token = getApiAccessToken();

  if (body != null && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const devUsername = resolveDevUsername(auth);
  if (devUsername) {
    headers["X-Dev-User"] = devUsername;
  }

  return headers;
}

function mergeHeaders(
  baseHeaders: Record<string, string>,
  extraHeaders: HeadersInit | undefined
) {
  if (!extraHeaders) {
    return baseHeaders;
  }

  const merged = { ...baseHeaders };
  const normalizedHeaders = new Headers(extraHeaders);

  normalizedHeaders.forEach((value, key) => {
    const existingKey = Object.keys(merged).find(
      (candidate) => candidate.toLowerCase() === key.toLowerCase()
    );
    merged[existingKey ?? key] = value;
  });

  return merged;
}

function isDevAuthParams(value: unknown): value is DevAuthParams {
  return !!value && typeof value === "object" && "devUsername" in value;
}

async function aiRequest<T>(
  path: string,
  fallbackMessage: string,
  options: RequestInit = {},
  auth?: DevAuthParams
) {
  const res = await fetch(`${getAiBaseUrl()}${path}`, {
    ...options,
    headers: mergeHeaders(buildAiHeaders(auth, options.body), options.headers),
  });

  if (!res.ok) {
    throw new Error(await readAiError(res, fallbackMessage));
  }

  return (await res.json()) as T;
}

export async function createConversation(
  auth: DevAuthParams,
  params?: CreateConversationParams
): Promise<{ conversation_id: number }>;
export async function createConversation(
  params?: CreateConversationParams
): Promise<{ conversation_id: number }>;
export async function createConversation(
  authOrParams?: DevAuthParams | CreateConversationParams,
  maybeParams?: CreateConversationParams
) {
  const auth = isDevAuthParams(authOrParams) ? authOrParams : undefined;
  const params = isDevAuthParams(authOrParams) ? maybeParams : authOrParams;

  return aiRequest<{ conversation_id: number }>(
    "/api/ai/conversations/",
    "createConversation failed",
    {
      method: "POST",
      body: JSON.stringify(params ?? {}),
    },
    auth
  );
}

export async function sendMessage(
  auth: DevAuthParams,
  conversationId: number,
  content: string,
  actionPayload?: Record<string, unknown>
): Promise<{
  user_message: ApiMessage;
  assistant_message: ApiMessage & { metadata_json?: AiAssistantMetadata };
}>;
export async function sendMessage(
  conversationId: number,
  content: string,
  actionPayload?: Record<string, unknown>
): Promise<{
  user_message: ApiMessage;
  assistant_message: ApiMessage & { metadata_json?: AiAssistantMetadata };
}>;
export async function sendMessage(
  authOrConversationId: DevAuthParams | number,
  conversationIdOrContent: number | string,
  contentOrActionPayload?: string | Record<string, unknown>,
  maybeActionPayload?: Record<string, unknown>
) {
  const auth =
    typeof authOrConversationId === "number" ? undefined : authOrConversationId;
  const conversationId =
    typeof authOrConversationId === "number"
      ? authOrConversationId
      : (conversationIdOrContent as number);
  const content =
    typeof authOrConversationId === "number"
      ? (conversationIdOrContent as string)
      : (contentOrActionPayload as string);
  const actionPayload =
    typeof authOrConversationId === "number"
      ? (contentOrActionPayload as Record<string, unknown> | undefined)
      : maybeActionPayload;
  const requestBody = actionPayload
    ? { content, action_payload: actionPayload }
    : { content };

  return aiRequest<{
    user_message: ApiMessage;
    assistant_message: ApiMessage & { metadata_json?: AiAssistantMetadata };
  }>(
    `/api/ai/conversations/${conversationId}/messages/`,
    "sendMessage failed",
    {
      method: "POST",
      body: JSON.stringify(requestBody),
    },
    auth
  );
}

export async function listMessages(
  auth: DevAuthParams,
  conversationId: number
): Promise<ApiMessage[]>;
export async function listMessages(conversationId: number): Promise<ApiMessage[]>;
export async function listMessages(
  authOrConversationId: DevAuthParams | number,
  maybeConversationId?: number
) {
  const auth =
    typeof authOrConversationId === "number" ? undefined : authOrConversationId;
  const conversationId =
    typeof authOrConversationId === "number"
      ? authOrConversationId
      : maybeConversationId;

  return aiRequest<ApiMessage[]>(
    `/api/ai/conversations/${conversationId}/messages/`,
    "listMessages failed",
    undefined,
    auth
  );
}
