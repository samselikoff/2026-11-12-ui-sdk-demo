import { SearchField } from "./search-field";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-32 font-sans dark:bg-black">
      <SearchField />
    </main>
  );
}
