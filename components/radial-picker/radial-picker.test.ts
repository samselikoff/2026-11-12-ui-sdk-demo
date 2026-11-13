import { checkPattern, checkServer, mount } from "@ui-sdk/core/testing";
import { afterEach, beforeEach, expect, test } from "vitest";
import { radialPicker, type RadialPickerOptions } from "./radial-picker";

const items = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "townhome", label: "Townhome" },
  { value: "condo", label: "Condo" },
];

const markup = `<root aria-label="Home type">
  <trigger>Home Type</trigger>
  <ring>
    <option value="apartment">Apartment</option>
    <option value="house">House</option>
    <option value="townhome">Townhome</option>
    <option value="condo">Condo</option>
  </ring>
</root>`;

const mounted: { unmount(): void }[] = [];
afterEach(() => mounted.splice(0).forEach((view) => view.unmount()));

function mountPicker(options: RadialPickerOptions = {}) {
  const view = mount(radialPicker, { items, ...options }, markup);
  mounted.push(view);
  return view;
}

type View = ReturnType<typeof mountPicker>;
const open = (view: View) => view.state.open;
const trigger = (view: View) => view.part("trigger") as HTMLElement;

test("a virtual click opens the ring and a click on a type chooses it", async () => {
  const view = mountPicker();
  expect(trigger(view).getAttribute("aria-expanded")).toBe("false");

  trigger(view).click();
  expect(open(view)).toBe(true);
  expect(trigger(view).getAttribute("aria-controls")).toBe(
    (view.part("ring") as HTMLElement).id
  );

  await view.click(view.part("option", "townhome") as HTMLElement);
  expect(view.state.value).toBe("townhome");
  expect(open(view)).toBe(false);
  expect(view.changes.find((c) => c.key === "value")).toMatchObject({
    reason: "item-press",
  });
});

test("arrows move the highlight around the ring and Enter chooses it", async () => {
  const view = mountPicker();
  trigger(view).focus();

  await view.keys("ArrowDown");
  expect(open(view)).toBe(true);

  const steps: [string, string][] = [
    ["ArrowDown", "apartment"],
    ["ArrowDown", "house"],
    ["ArrowRight", "townhome"],
    ["ArrowRight", "condo"],
    ["ArrowDown", "apartment"],
    ["ArrowUp", "condo"],
    ["ArrowLeft", "townhome"],
  ];
  for (const [key, value] of steps) {
    await view.keys(key);
    expect(view.state.highlighted).toBe(value);
    const option = view.part("option", value) as HTMLElement;
    expect(trigger(view).getAttribute("aria-activedescendant")).toBe(option.id);
    expect(option.hasAttribute("data-highlighted")).toBe(true);
  }

  await view.keys("ArrowUp", "Enter");
  expect(view.state.value).toBe("house");
  expect(open(view)).toBe(false);
  expect(document.activeElement).toBe(trigger(view));
  expect(view.changes.find((c) => c.key === "value")).toMatchObject({
    source: "keyboard",
  });
});

test("Escape closes without choosing, and reopening highlights the value", async () => {
  const view = mountPicker({ defaultValue: "condo" });
  trigger(view).focus();

  await view.keys("Enter");
  expect(open(view)).toBe(true);
  expect(view.state.highlighted).toBe("condo");

  await view.keys("ArrowUp", "Escape");
  expect(open(view)).toBe(false);
  expect(view.state.value).toBe("condo");
});

test("tabbing away closes the ring", async () => {
  const view = mountPicker();
  const after = document.body.appendChild(document.createElement("button"));
  trigger(view).focus();
  await view.keys("Enter");
  expect(open(view)).toBe(true);

  await view.keys("Tab");
  expect(open(view)).toBe(false);
  after.remove();
});

test("a press outside closes the ring", async () => {
  const view = mountPicker();
  trigger(view).click();
  expect(open(view)).toBe(true);

  document.body.dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true, button: 0 })
  );
  document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await view.settle();
  expect(open(view)).toBe(false);
});

const centered = (el: HTMLElement) => {
  el.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0 }) as DOMRect;
};

const pointer = (type: string, el: Element, x: number, y: number) =>
  el.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      buttons: type === "pointerup" ? 0 : 1,
      isPrimary: true,
      clientX: x,
      clientY: y,
    })
  );

const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));

beforeEach(() => {
  HTMLElement.prototype.setPointerCapture ??= function () {};
  HTMLElement.prototype.releasePointerCapture ??= function () {};
  HTMLElement.prototype.hasPointerCapture ??= () => true;
});

const click = (el: Element) =>
  el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }));

test("pressing opens the ring at once, dragging highlights, and release chooses", async () => {
  const view = mountPicker();
  const el = trigger(view);
  centered(el);

  pointer("pointerdown", el, 50, 50);
  expect(open(view)).toBe(true);

  pointer("pointermove", el, 50, -30);
  await frame();
  expect(view.state.highlighted).toBe("apartment");

  pointer("pointermove", el, 140, 55);
  await frame();
  expect(view.state.highlighted).toBe("house");

  pointer("pointerup", el, 140, 55);
  await view.settle();
  expect(view.state.value).toBe("house");
  expect(open(view)).toBe(false);
  expect(view.changes.find((c) => c.key === "value")).toMatchObject({
    reason: "trigger-release",
  });
});

test("after a drag chooses, Enter still opens the ring", async () => {
  const view = mountPicker();
  const el = trigger(view);
  centered(el);

  pointer("pointerdown", el, 50, 50);
  pointer("pointermove", el, 140, 55);
  await frame();
  pointer("pointerup", el, 140, 55);
  await view.settle();
  expect(view.state.value).toBe("house");

  el.focus();
  await view.keys("Enter");
  expect(open(view)).toBe(true);
});

test("a tap opens the ring and the release closes it", async () => {
  const view = mountPicker();
  const el = trigger(view);
  centered(el);

  pointer("pointerdown", el, 50, 50);
  expect(open(view)).toBe(true);
  pointer("pointerup", el, 50, 50);
  click(el);
  await view.settle();
  expect(open(view)).toBe(false);
  expect(view.state.value).toBe(null);
  expect(view.changes.filter((c) => c.key === "open").map((c) => c.value)).toEqual([
    true,
    false,
  ]);
});

test("releasing a drag back over the button closes without choosing", async () => {
  const view = mountPicker();
  const el = trigger(view);
  centered(el);

  pointer("pointerdown", el, 50, 50);
  pointer("pointermove", el, 50, -30);
  await frame();
  expect(view.state.highlighted).toBe("apartment");
  pointer("pointermove", el, 55, 45);
  await frame();
  expect(view.state.highlighted).toBe(null);

  pointer("pointerup", el, 55, 45);
  click(el);
  await view.settle();
  expect(open(view)).toBe(false);
  expect(view.state.value).toBe(null);
});

test("pressing the button while the keyboard has the ring open closes it", async () => {
  const view = mountPicker();
  const el = trigger(view);
  centered(el);
  el.focus();
  await view.keys("ArrowDown");
  expect(open(view)).toBe(true);

  pointer("pointerdown", el, 50, 50);
  pointer("pointerup", el, 50, 50);
  click(el);
  await view.settle();
  expect(open(view)).toBe(false);
});

test("with confirmDelay, the choice blinks before the ring closes, and input waits", async () => {
  const view = mountPicker({ confirmDelay: 300 });
  const el = trigger(view);
  centered(el);

  pointer("pointerdown", el, 50, 50);
  pointer("pointermove", el, 140, 55);
  await frame();
  pointer("pointerup", el, 140, 55);
  click(el);
  expect(view.state.value).toBe("house");
  expect(open(view)).toBe(true);
  const house = view.part("option", "house") as HTMLElement;
  expect(house.hasAttribute("data-confirming")).toBe(true);
  expect(house.hasAttribute("data-highlighted")).toBe(true);
  expect((view.part("ring") as HTMLElement).style.getPropertyValue("--radial-confirm-delay")).toBe("300ms");

  el.focus();
  await view.keys("ArrowDown");
  expect(view.state.highlighted).toBe("house");
  await view.hover(view.part("option", "condo") as HTMLElement);
  expect(view.state.highlighted).not.toBe("condo");
  expect(house.hasAttribute("data-confirming")).toBe(true);
  await view.click(view.part("option", "condo") as HTMLElement);
  expect(view.state.value).toBe("house");

  await new Promise((r) => setTimeout(r, 340));
  expect(open(view)).toBe(false);
  expect(house.isConnected).toBe(false);
  expect(view.state.confirming).toBe(null);
});

test("closing during the confirm blink cancels it", async () => {
  const view = mountPicker({ confirmDelay: 60 });
  trigger(view).click();
  await view.click(view.part("option", "condo") as HTMLElement);
  expect(open(view)).toBe(true);

  view.api.setOpen(false, { reason: "escape-key" });
  expect(open(view)).toBe(false);
  expect(view.state.confirming).toBe(null);

  trigger(view).click();
  await new Promise((r) => setTimeout(r, 90));
  expect(open(view)).toBe(true);
});

test("renders on the server", () => {
  const html = checkServer(radialPicker, { items, defaultValue: "house" }, markup);
  expect(html).toContain('role="combobox"');
  expect(html).toContain('aria-expanded="false"');
});

test("follows the combobox pattern", async () => {
  const view = mountPicker();
  await checkPattern(view.root, "combobox");
});
