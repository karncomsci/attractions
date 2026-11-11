"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ApiError,
  createAttraction,
  updateAttraction,
  type Attraction,
  type AttractionFieldErrors,
  type AttractionInput,
} from "@/lib/attractions-api";
import { buttonPrimary, buttonSecondary } from "@/app/ui/styles";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base font-medium text-zinc-950 focus-visible:outline-2 focus-visible:outline-emerald-600 aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

/** Creates a new attraction, or edits `attraction` when one is passed. */
export function AttractionForm({ attraction }: { attraction?: Attraction }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AttractionFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const text = (name: keyof AttractionInput) => String(values.get(name) ?? "");
    const input: AttractionInput = {
      name: text("name"),
      detail: text("detail"),
      coverimage: text("coverimage"),
      // An empty or non-numeric value becomes NaN, which is sent as null and rejected by the API.
      latitude: Number.parseFloat(text("latitude")),
      longitude: Number.parseFloat(text("longitude")),
    };

    setPending(true);
    setFieldErrors({});
    setFormError(null);
    try {
      const saved = attraction
        ? await updateAttraction(attraction.id, input)
        : await createAttraction(input);
      // This page stays mounted (hidden) after navigating away, so clear the
      // create form now or the Back button would show the submitted values.
      if (!attraction) form.reset();
      router.push(`/attractions/${saved.id}`);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fields).length > 0) {
        setFieldErrors(error.fields);
        setFormError("Please fix the highlighted fields.");
      } else if (error instanceof ApiError && error.status === 404) {
        setFormError("This attraction no longer exists.");
      } else {
        setFormError("Could not save. Check your connection and try again.");
      }
    } finally {
      setPending(false);
    }
  }

  const cancelHref = attraction ? `/attractions/${attraction.id}` : "/";

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <Field label="Name" name="name" error={fieldErrors.name}>
        {(props) => (
          <input
            {...props}
            type="text"
            required
            maxLength={255}
            defaultValue={attraction?.name}
            className={inputClass}
          />
        )}
      </Field>
      <Field label="Detail" name="detail" error={fieldErrors.detail}>
        {(props) => (
          <textarea
            {...props}
            required
            rows={5}
            defaultValue={attraction?.detail}
            className={inputClass}
          />
        )}
      </Field>
      <Field
        label="Cover image URL"
        name="coverimage"
        error={fieldErrors.coverimage}
      >
        {(props) => (
          <input
            {...props}
            type="url"
            required
            maxLength={2048}
            placeholder="https://example.com/photo.jpg"
            defaultValue={attraction?.coverimage}
            className={inputClass}
          />
        )}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Latitude" name="latitude" error={fieldErrors.latitude}>
          {(props) => (
            <input
              {...props}
              type="number"
              required
              step="any"
              min={-90}
              max={90}
              placeholder="13.751389"
              defaultValue={attraction?.latitude}
              className={inputClass}
            />
          )}
        </Field>
        <Field label="Longitude" name="longitude" error={fieldErrors.longitude}>
          {(props) => (
            <input
              {...props}
              type="number"
              required
              step="any"
              min={-180}
              max={180}
              placeholder="100.4925"
              defaultValue={attraction?.longitude}
              className={inputClass}
            />
          )}
        </Field>
      </div>

      {formError && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {formError}
        </p>
      )}
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? "Saving…" : attraction ? "Save changes" : "Add attraction"}
        </button>
        <Link href={cancelHref} className={buttonSecondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

/** A label, its control, and the control's error message, wired together for screen readers. */
function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: keyof AttractionInput;
  error?: string;
  children: (props: {
    id: string;
    name: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
}) {
  // Generated ids: hidden pages stay in the DOM, so fixed ids could collide
  // between the create form and an edit form.
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children({
        id,
        name,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
