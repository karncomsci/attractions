import Link from "next/link";
import { ApiError } from "@/lib/attractions-api";
import { buttonSecondary } from "@/app/ui/styles";

/** Shown when loading from the API fails, including a 404 for a missing attraction. */
export function LoadError({ error }: { error: unknown }) {
  const notFound = error instanceof ApiError && error.status === 404;
  return (
    <div role="alert" className="flex flex-col items-start gap-4 py-12">
      <h1 className="text-2xl font-semibold">
        {notFound ? "Attraction not found" : "Something went wrong"}
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        {notFound
          ? "It may have been deleted."
          : "The data could not be loaded. Check that the server and database are running, then reload the page."}
      </p>
      <Link href="/" className={buttonSecondary}>
        Back to all attractions
      </Link>
    </div>
  );
}
