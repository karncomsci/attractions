import { Suspense } from "react";
import type { Metadata } from "next";
import { EditAttraction } from "@/app/ui/edit-attraction";

export const metadata: Metadata = { title: "Edit attraction" };

export default function EditAttractionPage() {
  return (
    // The id comes from the URL at request time, so the reader must be in Suspense.
    <Suspense fallback={<p className="py-12 text-zinc-500">Loading attraction…</p>}>
      <EditAttraction />
    </Suspense>
  );
}
