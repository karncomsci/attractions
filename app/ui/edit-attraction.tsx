"use client";

import { AttractionForm } from "@/app/ui/attraction-form";
import { LoadError } from "@/app/ui/load-error";
import { useRouteAttraction } from "@/app/ui/use-route-attraction";

export function EditAttraction() {
  const result = useRouteAttraction();

  if (result.status === "loading") {
    return <p className="py-12 text-zinc-500">Loading attraction…</p>;
  }
  if (result.status === "error") return <LoadError error={result.error} />;

  return (
    <>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        Edit {result.data.name}
      </h1>
      {/* Keyed on the loaded data: if a refetch returns different values, the
          form remounts with them instead of keeping inputs from the old copy. */}
      <AttractionForm
        key={JSON.stringify(result.data)}
        attraction={result.data}
      />
    </>
  );
}
