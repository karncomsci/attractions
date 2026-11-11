import type { Metadata } from "next";
import { AttractionForm } from "@/app/ui/attraction-form";

export const metadata: Metadata = { title: "Add attraction" };

export default function NewAttractionPage() {
  return (
    <>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        Add attraction
      </h1>
      <AttractionForm />
    </>
  );
}
