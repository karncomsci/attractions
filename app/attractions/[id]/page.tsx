import { Suspense } from "react";
import type { Metadata } from "next";
import { AttractionDetail } from "@/app/ui/attraction-detail";

export const metadata: Metadata = { title: "Attraction" };

export default function AttractionPage() {
  return (
    // The id comes from the URL at request time, so the reader must be in Suspense.
    <Suspense fallback={<p className="py-12 text-zinc-500">Loading attraction…</p>}>
      <AttractionDetail />
    </Suspense>
  );
}
