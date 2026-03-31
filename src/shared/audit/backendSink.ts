import { getValidatedUrlOrThrow, resolveApiBaseUrl } from "@/config/apiEnv";
import { getApiAccessToken } from "@/api/client";
import { addAuditSink, type AuditEvent } from "./audit";

const AUDIT_INGEST_PATH = "/api/audit/events/";
const apiEnvResult = resolveApiBaseUrl();

function getAuditIngestUrl() {
  return `${getValidatedUrlOrThrow(apiEnvResult)}${AUDIT_INGEST_PATH}`;
}

function buildAuditHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getApiAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function postAuditEvent(event: AuditEvent) {
  try {
    await fetch(getAuditIngestUrl(), {
      method: "POST",
      headers: buildAuditHeaders(),
      body: JSON.stringify(event),
      keepalive: true,
    });
  } catch {
    // Keep audit transport failures invisible to the main UX.
  }
}

let unregisterBackendAuditSink: (() => void) | null = null;

export function registerBackendAuditSink() {
  if (unregisterBackendAuditSink) {
    return unregisterBackendAuditSink;
  }

  unregisterBackendAuditSink = addAuditSink((event) => {
    void postAuditEvent(event);
  });

  return unregisterBackendAuditSink;
}

export function resetBackendAuditSinkForTests() {
  unregisterBackendAuditSink?.();
  unregisterBackendAuditSink = null;
}
