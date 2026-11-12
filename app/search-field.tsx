import { Input, InputClear, InputGroup } from "@ui-sdk/react/input";

export function SearchField() {
  return (
    <InputGroup className="relative w-full max-w-sm">
      <Input
        type="search"
        name="q"
        aria-label="Search"
        placeholder="Search"
        className="pe-9 [&::-webkit-search-cancel-button]:appearance-none"
      />
      <InputClear
        aria-label="Clear search"
        className="absolute inset-y-0 end-0 grid w-8 cursor-pointer place-items-center text-zinc-500 hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground dark:text-zinc-400"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </InputClear>
    </InputGroup>
  );
}
