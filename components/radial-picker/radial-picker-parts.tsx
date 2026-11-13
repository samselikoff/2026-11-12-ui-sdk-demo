"use client";

import { createParts, type PartProps } from "@ui-sdk/react/primitive";
import type { ReactNode } from "react";
import {
  radialPicker,
  type RadialPickerItem,
  type RadialPickerOptions,
} from "./radial-picker";

const parts = createParts(radialPicker, {
  root: "div",
  trigger: "button",
  ring: "div",
  option: "div",
});

export const RadialPickerRoot = parts.Root;
export const RadialPickerTrigger = parts.Trigger;
export const RadialPickerRing = parts.Ring;
export const RadialPickerOption = parts.Option;

type RadialPickerProps = Omit<RadialPickerOptions, "items"> &
  Omit<PartProps<"div">, "defaultValue" | "children"> & {
    items: (RadialPickerItem & { icon?: ReactNode })[];
    placeholder: ReactNode;
  };

export function RadialPicker({ items, placeholder, ...props }: RadialPickerProps) {
  return (
    <parts.Root items={items.map(({ value, label }) => ({ value, label }))} {...props}>
      <parts.Trigger>
        {({ label, highlightedLabel, open }) =>
          (open && highlightedLabel) || label || placeholder
        }
      </parts.Trigger>
      <parts.Ring>
        {items.map((item) => (
          <parts.Option key={item.value} value={item.value}>
            {item.icon ? (
              <span>
                {item.icon}
                <span className="sr-only">{item.label}</span>
              </span>
            ) : (
              <span>{item.label}</span>
            )}
          </parts.Option>
        ))}
      </parts.Ring>
    </parts.Root>
  );
}
