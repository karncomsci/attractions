import {
  deleteAttraction,
  getAttraction,
  parseAttractionId,
  parseAttractionInput,
  updateAttraction,
} from "@/lib/attractions";

type Context = RouteContext<"/api/attractions/[id]">;

const notFound = () =>
  Response.json({ error: "Attraction not found" }, { status: 404 });

export async function GET(_request: Request, { params }: Context) {
  const id = parseAttractionId((await params).id);
  const attraction = id === null ? null : await getAttraction(id);
  return attraction ? Response.json(attraction) : notFound();
}

export async function PUT(request: Request, { params }: Context) {
  const id = parseAttractionId((await params).id);
  if (id === null) return notFound();

  const parsed = parseAttractionInput(await request.json().catch(() => null));
  if (!parsed.ok) {
    return Response.json(
      { error: "Validation failed", fields: parsed.errors },
      { status: 400 },
    );
  }
  const attraction = await updateAttraction(id, parsed.data);
  return attraction ? Response.json(attraction) : notFound();
}

export async function DELETE(_request: Request, { params }: Context) {
  const id = parseAttractionId((await params).id);
  const deleted = id !== null && (await deleteAttraction(id));
  return deleted ? new Response(null, { status: 204 }) : notFound();
}
