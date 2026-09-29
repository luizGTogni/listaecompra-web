import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";
import { ITEM_UNITS, UNIT_INFO } from "../units";

// A native <select>: the best picker on a phone, and cheap to test.
export function UnitSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "h-11 w-full min-w-0 cursor-pointer rounded-lg border border-input bg-transparent px-2 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        className,
      )}
      {...props}
    >
      {ITEM_UNITS.map((unit) => (
        <option
          key={unit}
          value={unit}
          // The open list is drawn by the browser: without explicit colors it
          // keeps a light background under the theme's light text in dark mode.
          className="bg-popover text-popover-foreground"
        >
          {UNIT_INFO[unit].label}
        </option>
      ))}
    </select>
  );
}
