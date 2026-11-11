"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteAttraction, type Attraction } from "@/lib/attractions-api";
import { CoverImage } from "@/app/ui/cover-image";
import { LoadError } from "@/app/ui/load-error";
import { buttonDanger, buttonSecondary } from "@/app/ui/styles";
import { useRouteAttraction } from "@/app/ui/use-route-attraction";

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "long" });

export function AttractionDetail() {
  const result = useRouteAttraction();

  if (result.status === "loading") {
    return <p className="py-12 text-zinc-500">Loading attraction…</p>;
  }
  if (result.status === "error") return <LoadError error={result.error} />;

  const attraction = result.data;
  const mapUrl = `https://www.google.com/maps?q=${attraction.latitude},${attraction.longitude}`;

  return (
    <article className="flex flex-col gap-6">
      <Link
        href="/"
        className="self-start text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← All attractions
      </Link>
      <CoverImage
        src={attraction.coverimage}
        alt={attraction.name}
        className="aspect-[2/1] w-full rounded-xl"
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          {attraction.name}
        </h1>
        <div className="flex gap-2">
          <Link
            href={`/attractions/${attraction.id}/edit`}
            className={buttonSecondary}
          >
            Edit
          </Link>
          <DeleteButton attraction={attraction} />
        </div>
      </div>
      <p className="max-w-prose text-lg leading-8 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
        {attraction.detail}
      </p>
      <dl className="grid gap-4 border-t border-zinc-200 pt-6 text-sm sm:grid-cols-3 dark:border-zinc-800">
        <div>
          <dt className="text-zinc-500">Coordinates</dt>
          <dd className="font-mono">
            {attraction.latitude}, {attraction.longitude}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Map</dt>
          <dd>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 underline dark:text-emerald-400"
            >
              Open in Google Maps
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Added</dt>
          <dd>{dateFormat.format(new Date(attraction.createdAt))}</dd>
        </div>
      </dl>
    </article>
  );
}

function DeleteButton({ attraction }: { attraction: Attraction }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete "${attraction.name}"? This cannot be undone.`)) {
      return;
    }
    setPending(true);
    setFailed(false);
    try {
      await deleteAttraction(attraction.id);
      router.push("/");
    } catch {
      setFailed(true);
    } finally {
      // Always clear: this page stays mounted (hidden) after navigating away.
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className={buttonDanger}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {failed && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          Could not delete. Try again.
        </p>
      )}
    </div>
  );
}
