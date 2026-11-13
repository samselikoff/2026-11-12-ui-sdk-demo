import { WeaponPicker } from "./weapon-picker";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-48 font-sans dark:bg-black">
      <WeaponPicker />
    </main>
  );
}
