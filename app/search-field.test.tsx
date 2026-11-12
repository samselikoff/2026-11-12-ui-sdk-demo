import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { expect, test } from "vitest";
import { SearchField } from "./search-field";

const agent = createAgent();

test("Clear shows only with text, empties the input and refocuses it", async () => {
  const user = userEvent.setup();
  render(<SearchField />);
  const input = screen.getByRole<HTMLInputElement>("searchbox", {
    name: "Search",
  });

  expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();

  await user.type(input, "react");
  const clear = screen.getByRole("button", { name: "Clear search" });

  await user.click(clear);
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);
  expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
});

test("Clear works from the keyboard", async () => {
  const user = userEvent.setup();
  render(<SearchField />);
  const input = screen.getByRole<HTMLInputElement>("searchbox", {
    name: "Search",
  });

  await user.type(input, "vue");
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Clear search" })
  );
  await user.keyboard("{Enter}");
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);
});

test("an agent can find, fill and clear the search", async () => {
  render(<SearchField />);

  const labels = agent
    .snapshot()
    .filter((entry) => !entry.offPage)
    .map((entry) => entry.label);
  expect(labels).toContain("Search");

  const input = screen.getByRole<HTMLInputElement>("searchbox", {
    name: "Search",
  });
  const filled = await agent.act({
    steps: [{ ref: "Search", action: "setValue", args: ["svelte"] }],
  });
  expect(filled.ok, filled.error?.message).toBe(true);
  expect(input.value).toBe("svelte");

  const refilled = await agent.act({
    steps: [{ ref: "Search", action: "setValue", args: ["solid"] }],
  });
  expect(refilled.ok, refilled.error?.message).toBe(true);
  expect(input.value).toBe("solid");

  const cleared = await agent.act({
    steps: [{ ref: "Clear search", action: "clear" }],
  });
  expect(cleared.ok, cleared.error?.message).toBe(true);
  expect(input.value).toBe("");
});

// ui-sdk 0.1.0-beta.1: InputGroup registers as a second, unnamed "input" entry.
test.fails("every agent entry has a name", () => {
  render(<SearchField />);

  const components = agent
    .snapshot()
    .filter((entry) => !entry.offPage && entry.component !== "more");
  for (const entry of components) {
    expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
  }
});
