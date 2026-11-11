import { AttractionList } from "@/app/ui/attraction-list";

export default function Home() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Attractions</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Famous places around the world. Select one to see details, edit or
          delete it.
        </p>
      </div>
      <AttractionList />
    </>
  );
}
