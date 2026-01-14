"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  ...props
}: CalendarProps) {
  const defaultClassNames = {
    months: "relative flex flex-col sm:flex-row",
    month: "w-full",
    month_caption: "relative flex items-center justify-center z-20",
    caption_label: "text-sm font-medium",
    nav: "absolute top-0 flex w-full justify-between z-10",
    button_previous: cn(
      buttonVariants({ variant: "ghost" }),
      "text-muted-foreground/80 hover:text-foreground"
    ),
    button_next: cn(
      buttonVariants({ variant: "ghost" }),
      "text-muted-foreground/80 hover:text-foreground"
    ),
    weekday: "text-xs font-medium text-muted-foreground/80 text-center",
    day_button:
      "relative flex items-center justify-center whitespace-nowrap rounded-lg text-foreground outline-offset-2 focus:outline-none hover:bg-accent group-data-[selected]:bg-primary hover:text-foreground group-data-[selected]:text-primary-foreground group-data-[disabled]:text-foreground/30 group-data-[disabled]:line-through group-data-[outside]:text-foreground/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70",
    day: "group text-sm",
    range_start: "range-start",
    range_end: "range-end",
    range_middle: "range-middle",
    today: "font-bold text-primary",
    outside: "text-muted-foreground/50",
    hidden: "invisible",
    week_number: "text-xs font-medium text-muted-foreground/80",
  };

  const mergedClassNames: typeof defaultClassNames = Object.keys(defaultClassNames).reduce(
    (acc, key) => ({
      ...acc,
      [key]: classNames?.[key as keyof typeof classNames]
        ? cn(
            defaultClassNames[key as keyof typeof defaultClassNames],
            classNames[key as keyof typeof classNames],
          )
        : defaultClassNames[key as keyof typeof defaultClassNames],
    }),
    {} as typeof defaultClassNames,
  );

  const defaultComponents = {
    Chevron: (props: React.SVGProps<SVGSVGElement> & { orientation?: string }) => {
      if (props.orientation === "left") {
        return <ChevronLeft size={16} strokeWidth={2} {...props} aria-hidden="true" />;
      }
      return <ChevronRight size={16} strokeWidth={2} {...props} aria-hidden="true" />;
    },
  };

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit", className)}
      classNames={mergedClassNames}
      components={mergedComponents}
      styles={{
        months: { gap: "24px", padding: "12px" },
        month_caption: { marginLeft: "40px", marginRight: "40px", marginBottom: "12px", height: "44px" },
        nav: { padding: "6px" },
        button_previous: { width: "34px", height: "34px", padding: 0, borderRadius: "8px" },
        button_next: { width: "34px", height: "34px", padding: 0, borderRadius: "8px" },
        weekdays: { marginBottom: "10px", gap: "6px" },
        weekday: { width: "44px", height: "36px", padding: "6px" },
        weeks: { gap: "6px" },
        week: { gap: "6px" },
        day: { width: "44px", height: "44px", padding: "4px" },
        day_button: { width: "36px", height: "36px", padding: 0, borderRadius: "10px" },
        week_number: { width: "44px", height: "44px", padding: "6px" },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
