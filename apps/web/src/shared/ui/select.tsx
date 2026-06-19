import * as React from "react";

import { cn } from "@/lib/utils";

type SelectProps =
  React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<
  HTMLSelectElement,
  SelectProps
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";