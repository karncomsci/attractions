import "server-only";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type AttractionInput = {
  name: string;
  detail: string;
  coverimage: string;
  latitude: number;
  longitude: number;
};

export type AttractionFieldErrors = Partial<
  Record<keyof AttractionInput | "body", string>
>;

type ParseResult =
  | { ok: true; data: AttractionInput }
  | { ok: false; errors: AttractionFieldErrors };

// Limits mirror the column types in prisma/schema.prisma.
const NAME_MAX = 255;
const DETAIL_MAX_BYTES = 65_535;
const COVERIMAGE_MAX = 2048;
const INT_MAX = 2_147_483_647;

/** Validates an untrusted request body. Unknown keys (id, createdAt, ...) are dropped. */
export function parseAttractionInput(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, errors: { body: "Request body must be a JSON object." } };
  }
  const input = body as Record<string, unknown>;
  const errors: AttractionFieldErrors = {};

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name) errors.name = "Name is required.";
  else if (name.length > NAME_MAX)
    errors.name = `Name must be at most ${NAME_MAX} characters.`;

  const detail = typeof input.detail === "string" ? input.detail.trim() : "";
  if (!detail) errors.detail = "Detail is required.";
  else if (Buffer.byteLength(detail) > DETAIL_MAX_BYTES)
    errors.detail = "Detail is too long.";

  const coverimage =
    typeof input.coverimage === "string" ? input.coverimage.trim() : "";
  if (!coverimage) errors.coverimage = "Cover image URL is required.";
  else if (coverimage.length > COVERIMAGE_MAX)
    errors.coverimage = `Cover image URL must be at most ${COVERIMAGE_MAX} characters.`;
  else if (!isHttpUrl(coverimage))
    errors.coverimage = "Cover image must be an http(s) URL.";

  const { latitude, longitude } = input;
  if (!isNumberInRange(latitude, 90))
    errors.latitude = "Latitude must be a number between -90 and 90.";
  if (!isNumberInRange(longitude, 180))
    errors.longitude = "Longitude must be a number between -180 and 180.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      name,
      detail,
      coverimage,
      latitude: latitude as number,
      longitude: longitude as number,
    },
  };
}

/** Parses a route param into a valid row id, or null if it can't be one. */
export function parseAttractionId(raw: string): number | null {
  if (!/^[1-9]\d{0,9}$/.test(raw)) return null;
  const id = Number(raw);
  return id <= INT_MAX ? id : null;
}

export function listAttractions() {
  return prisma.attraction.findMany({ orderBy: { id: "asc" } });
}

export function getAttraction(id: number) {
  return prisma.attraction.findUnique({ where: { id } });
}

export function createAttraction(data: AttractionInput) {
  return prisma.attraction.create({ data });
}

/** Returns the updated row, or null if no row has this id. */
export async function updateAttraction(id: number, data: AttractionInput) {
  try {
    return await prisma.attraction.update({ where: { id }, data });
  } catch (error) {
    if (isRecordNotFound(error)) return null;
    throw error;
  }
}

/** Returns false if no row has this id. */
export async function deleteAttraction(id: number) {
  try {
    await prisma.attraction.delete({ where: { id } });
    return true;
  } catch (error) {
    if (isRecordNotFound(error)) return false;
    throw error;
  }
}

function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function isNumberInRange(value: unknown, limit: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= limit;
}

function isRecordNotFound(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}
