import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { expect, test } from "vitest";
import { WeaponPicker } from "./weapon-picker";

const agent = createAgent();

test("shows the placeholder, the highlighted weapon while open, then the chosen one", async () => {
  const user = userEvent.setup();
  render(<WeaponPicker />);
  const trigger = screen.getByRole("combobox", { name: "Weapon" });
  expect(trigger.textContent).toBe("Weapon");
  expect(trigger.hasAttribute("data-placeholder")).toBe(true);

  await user.tab();
  await user.keyboard("{Enter}");
  const ring = screen.getByRole("listbox", { name: "Weapon" });
  expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
    "Rifle",
    "Sniper",
    "Shotgun",
    "Grenade",
    "Smoke",
    "Medkit",
    "Knife",
    "Pistol",
  ]);
  for (const option of screen.getAllByRole("option")) {
    expect(option.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  }
  expect(trigger.textContent).toBe("Weapon");

  await user.keyboard("{ArrowDown}{ArrowDown}");
  expect(trigger.textContent).toBe("Sniper");
  expect(trigger.getAttribute("aria-activedescendant")).toBe(
    screen.getByRole("option", { name: "Sniper" }).id
  );

  await user.click(screen.getByRole("option", { name: "Knife" }));
  expect(trigger.textContent).toBe("Knife");
  expect(screen.getByRole("option", { name: "Knife" }).hasAttribute("data-confirming")).toBe(true);
  await user.click(screen.getByRole("option", { name: "Pistol" }));
  await waitFor(() => expect(ring.isConnected).toBe(false), { timeout: 4000 });
  expect(trigger.textContent).toBe("Knife");
  expect(trigger.hasAttribute("data-placeholder")).toBe(false);
  expect(document.activeElement).toBe(trigger);

  await user.keyboard("{Enter}");
  expect(
    screen.getByRole("option", { name: "Knife" }).getAttribute("aria-selected")
  ).toBe("true");
  await user.keyboard("{Escape}");
  expect(trigger.textContent).toBe("Knife");
});

test("an agent can find and choose a weapon", async () => {
  render(<WeaponPicker />);

  const components = agent
    .snapshot()
    .filter((entry) => !entry.offPage && entry.component !== "more");
  for (const entry of components) {
    expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
  }
  const picker = components.find((entry) => entry.label === "Weapon");
  expect(picker, "Weapon is missing from the snapshot").toBeTruthy();
  expect(picker!.actions).toEqual(["setValue"]);

  const result = await agent.act({
    steps: [{ ref: "Weapon", action: "setValue", args: ["Shotgun"] }],
  });
  expect(result.ok, result.error?.message).toBe(true);
  expect(screen.getByRole("combobox", { name: "Weapon" }).textContent).toBe("Shotgun");

  const refused = await agent.act({
    steps: [{ ref: "Weapon", action: "setValue", args: ["Rocket launcher"] }],
  });
  expect(refused.ok).toBe(false);
  expect(refused.error?.message).toContain("Pistol");
});
