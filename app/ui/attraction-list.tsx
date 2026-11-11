"use client";

import Link from "next/link";
import { listAttractions } from "@/lib/attractions-api";
import { CoverImage } from "@/app/ui/cover-image";
import { LoadError } from "@/app/ui/load-error";
import { buttonPrimary } from "@/app/ui/styles";
import { useLoaded } from "@/app/ui/use-loaded";

const grid = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

export function AttractionList() {
  const result = useLoaded(listAttractions);

  if (result.status === "loading") {
    return (
      <div className={grid} aria-busy="true" aria-label="Loading attractions">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }
  if (result.status === "error") return <LoadError error={result.error} />;

  if (result.data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
        <p className="text-zinc-600 dark:text-zinc-400">No attractions yet.</p>
        <Link href="/attractions/new" className={buttonPrimary}>
          Add the first one
        </Link>
      </div>
    );
  }

  return (
    <ul className={grid}>
      {result.data.map((attraction) => (
        <li key={attraction.id}>
          <Link
            href={`/attractions/${attraction.id}`}
            className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <CoverImage
              src={attraction.coverimage}
              alt=""
              className="aspect-[3/2] w-full"
            />
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h2 className="text-lg font-semibold">{attraction.name}</h2>
              <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                {attraction.detail}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
