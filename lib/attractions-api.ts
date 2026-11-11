// Browser-side client for the /api/attractions REST API.
import type { AttractionFieldErrors, AttractionInput } from "@/lib/attractions";

export type { AttractionFieldErrors, AttractionInput };

/** An attraction as the API returns it (dates arrive as ISO strings). */
export type Attraction = AttractionInput & { id: number; createdAt: string };

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Per-field messages from a 400 validation response. */
    readonly fields: AttractionFieldErrors = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/attractions${path}`, init);
  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error ?? `Request failed (${response.status})`,
      body?.fields,
    );
  }
  return body as T;
}

const json = (method: string, input: AttractionInput): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(input),
});

export const listAttractions = () => request<Attraction[]>("");

export const getAttraction = (id: number | string) =>
  request<Attraction>(`/${encodeURIComponent(id)}`);

export const createAttraction = (input: AttractionInput) =>
  request<Attraction>("", json("POST", input));

export const updateAttraction = (id: number, input: AttractionInput) =>
  request<Attraction>(`/${id}`, json("PUT", input));

export const deleteAttraction = (id: number) =>
  request<void>(`/${id}`, { method: "DELETE" });
