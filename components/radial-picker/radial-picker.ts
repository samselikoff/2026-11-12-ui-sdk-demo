import {
  bindDrag,
  bindLayer,
  createChange,
  createListbox,
  css,
  definePrimitive,
  selects,
  type ChangeDetails,
} from "@ui-sdk/core";
import { sectorOf } from "@ui-sdk/core/gesture";

export type RadialPickerItem = { value: string; label: string };

// "imperative" isn't in the shared vocabulary.
export type RadialPickerValueReason =
  | "item-press"
  | "trigger-release"
  | "imperative";

export type RadialPickerOpenReason =
  | "trigger-press"
  | "item-press"
  | "trigger-release"
  | "escape-key"
  | "outside-press"
  | "focus-out";

export type RadialPickerOptions = {
  items?: RadialPickerItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (
    value: string | null,
    details: ChangeDetails<RadialPickerValueReason>
  ) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    details: ChangeDetails<RadialPickerOpenReason>
  ) => void;
};

type State = {
  items: RadialPickerItem[];
  value: string | null;
  open: boolean;
  highlighted: string | null;
};

export const radialPicker = definePrimitive({
  name: "radial-picker",
  options: {
    items: "value",
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    open: "boolean",
    defaultOpen: "boolean",
    onOpenChange: "callback",
  },
  controlled: ["value", "open"],
  state: (options: RadialPickerOptions): State => ({
    items: options.items ?? [],
    value: options.value ?? options.defaultValue ?? null,
    open: options.open ?? options.defaultOpen ?? false,
    highlighted: null,
  }),
  sync: (options) => ({
    items: options.items ?? [],
    ...(options.value === undefined ? {} : { value: options.value }),
    ...(options.open === undefined ? {} : { open: options.open }),
  }),
  api: (context) => {
    const { store } = context;
    const change = createChange(context);
    const listbox = createListbox(context, {
      key: "highlighted",
      focus: "virtual",
    });

    const setOpen = (
      open: boolean,
      { reason, event }: { reason: RadialPickerOpenReason; event?: Event }
    ) => {
      change("open", open, { reason, event });
      listbox.highlight(store.get().open ? store.get().value : null, { event });
    };

    const choose = (
      value: string,
      { reason, event }: { reason: "item-press" | "trigger-release"; event?: Event }
    ) => {
      change("value", value, { reason, event });
      setOpen(false, { reason, event });
    };

    const itemAt = (trigger: HTMLElement, x: number, y: number) => {
      const { items } = store.get();
      const rect = trigger.getBoundingClientRect();
      const index = sectorOf(
        x - (rect.left + rect.width / 2),
        y - (rect.top + rect.height / 2),
        items.length,
        { deadZone: Math.min(rect.width, rect.height) / 2 }
      );
      return index === -1 ? null : items[index].value;
    };

    let stopDrag: (() => void) | undefined;
    let pressed = false;
    context.onDestroy(() => stopDrag?.());

    return {
      listbox,
      items: () => store.get().items,
      trigger: () => context.element("trigger"),
      setValue: (value: string | null) =>
        change("value", value, { reason: "imperative" }),
      setOpen,
      choose,
      toggle(event?: Event) {
        // A pointer press already opened and closed the ring; its click shouldn't toggle it again.
        if (pressed) {
          pressed = false;
          return;
        }
        setOpen(!store.get().open, { reason: "trigger-press", event });
      },

      keydown(event: KeyboardEvent) {
        const { open, highlighted } = store.get();
        const arrow = event.key.startsWith("Arrow");
        if (!open) {
          if (!arrow) return;
          event.preventDefault();
          setOpen(true, { reason: "trigger-press", event });
          return;
        }
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          listbox.move(event.key === "ArrowRight" ? 1 : -1, event);
        } else if (listbox.keydown(event) !== undefined) {
          event.preventDefault();
        } else if (event.key === "Enter" || event.key === " ") {
          // Keeps the button's own click from toggling the ring shut.
          event.preventDefault();
          if (highlighted) choose(highlighted, { reason: "item-press", event });
          else setOpen(false, { reason: "trigger-press", event });
        } else if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false, { reason: "escape-key", event });
        }
      },

      pointerdown(event: PointerEvent, el: HTMLElement) {
        if (event.button !== 0) return;
        if (!store.get().open) setOpen(true, { reason: "trigger-press", event });
        if (!store.get().open) return;
        pressed = true;
        stopDrag?.();
        let dragged = false;
        stopDrag = bindDrag(el, event, {
          cancelOnEscape: true,
          onMove: ({ x, y, event }) => {
            dragged = true;
            listbox.highlight(itemAt(el, x, y), { event });
          },
          onEnd: (event, canceled) => {
            stopDrag = undefined;
            setTimeout(() => (pressed = false));
            if (canceled) {
              setOpen(false, { reason: "escape-key", event });
              return;
            }
            const value = dragged ? itemAt(el, event.clientX, event.clientY) : null;
            if (value) choose(value, { reason: "trigger-release", event });
            else setOpen(false, { reason: "trigger-release", event });
          },
        });
      },
    };
  },
  slots: (slot) => ({
    root: slot({
      role: "group",
      attrs: (_state, part) => ({ id: `${part.id}-root` }),
    }),
    trigger: slot<
      object,
      {
        value: string | null;
        label: string | null;
        highlightedLabel: string | null;
        open: boolean;
      }
    >({
      role: "combobox",
      focus: "native",
      press: ({ api }, event) => api.toggle(event),
      keys: ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft", "Enter", " ", "Escape"],
      state: (state) => ({
        value: state.value,
        label: state.items.find((item) => item.value === state.value)?.label ?? null,
        highlightedLabel:
          state.items.find((item) => item.value === state.highlighted)?.label ?? null,
        open: state.open,
      }),
      attrs: (state, part) => ({
        type: "button",
        "aria-labelledby": `${part.id}-root`,
        "aria-haspopup": "listbox",
        "aria-expanded": String(state.open),
        "aria-controls": state.open ? `${part.id}-ring` : undefined,
        "aria-activedescendant": state.open
          ? part.api.listbox.activeId(state)
          : undefined,
        "data-open": state.open ? "" : undefined,
        "data-placeholder": state.value === null ? "" : undefined,
      }),
      on: {
        keydown: (event, { api }) => api.keydown(event as KeyboardEvent),
        pointerdown: (event, { api, el }) =>
          api.pointerdown(event as PointerEvent, el!),
        blur: (event, { api, store }) => {
          if (store.get().open) api.setOpen(false, { reason: "focus-out", event });
        },
      },
    }),
    ring: slot({
      role: "listbox",
      keys: { none: "The trigger keeps focus and handles them." },
      present: (state) => state.open,
      attrs: (state, part) => ({
        id: `${part.id}-ring`,
        "aria-labelledby": `${part.id}-root`,
        style: css({ "--radial-count": state.items.length }),
      }),
      bind: (el, part) =>
        bindLayer(el, {
          contains: (target) => !!part.api.trigger()?.contains(target),
          onDismiss: (reason, event) =>
            part.api.setOpen(false, {
              reason: reason === "window-blur" ? "focus-out" : reason,
              event,
            }),
        }),
    }),
    option: slot<{ value: string }>({
      role: "option",
      focus: "active-descendant",
      props: { value: "string" },
      selects: selects({
        highlighted: ({ key }) => [key, null],
        value: ({ key }) => [key, null],
      }),
      attrs: (state, part) => {
        const index = state.items.findIndex((item) => item.value === part.key);
        return {
          ...part.api.listbox.attrs(state, part),
          "aria-selected": String(state.value === part.key),
          style: css({
            "--radial-index": index,
            "--radial-count": state.items.length,
          }),
        };
      },
      press: ({ key, api }, event) =>
        api.choose(key, { reason: "item-press", event }),
      on: {
        pointerdown: (event) => event.preventDefault(),
        pointermove: (event, { key, api }) =>
          api.listbox.highlight(key, { event }),
      },
      bind: (el, part) => part.api.listbox.bind(el, part),
    }),
  }),
  agent: { actions: ["setValue"], closed: true },
});
