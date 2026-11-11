import {
  createAttraction,
  listAttractions,
  parseAttractionInput,
} from "@/lib/attractions";

export async function GET() {
  return Response.json(await listAttractions());
}

export async function POST(request: Request) {
  const parsed = parseAttractionInput(await request.json().catch(() => null));
  if (!parsed.ok) {
    return Response.json(
      { error: "Validation failed", fields: parsed.errors },
      { status: 400 },
    );
  }
  const attraction = await createAttraction(parsed.data);
  return Response.json(attraction, {
    status: 201,
    headers: { Location: `/api/attractions/${attraction.id}` },
  });
}
