// Backend error bodies: `{ name, message }`, plus `fields` for validation
// failures (400 ValidationError), where `field` is the invalid body field.
export interface ApiErrorBody {
  name: string;
  message: string;
  fields?: { code: string; field: string; message: string }[];
}

// The server answered, but with a non-2xx status.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody | null,
    // Seconds from the `Retry-After` header (429 answers), when present.
    readonly retryAfter: number | null = null,
  ) {
    super(body?.message ?? `Request failed with status ${status}`);
    this.name = "ApiError";
  }
}

// The request never got an answer (offline, server down, CORS...).
export class NetworkError extends Error {
  constructor(options?: ErrorOptions) {
    super("Could not reach the server", options);
    this.name = "NetworkError";
  }
}

// Inlined at build time. The backend already owns port 3000, so `pnpm dev`
// runs Next on 3001 (the backend's CORS accepts any localhost port).
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export async function apiFetch<T>(
  path: string,
  init: Omit<RequestInit, "body"> & {
    body?: unknown;
    // Sent as `Authorization: Bearer <token>`.
    token?: string | null;
  } = {},
): Promise<T> {
  const { body, token, headers, ...rest } = init;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new NetworkError({ cause: error });
  }

  // 204 has no body to parse. A non-JSON error page (proxy, crash) becomes null.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const retryAfter = Number(response.headers.get("Retry-After"));
    throw new ApiError(
      response.status,
      data,
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null,
    );
  }

  return data as T;
}
