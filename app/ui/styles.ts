// Shared Tailwind class strings for buttons and button-like links.
const base =
  "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60";

export const buttonPrimary = `${base} bg-emerald-600 text-white hover:bg-emerald-700`;
export const buttonSecondary = `${base} border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800`;
export const buttonDanger = `${base} border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950`;
