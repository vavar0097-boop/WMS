import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-slate-950 text-white hover:bg-slate-800 border border-slate-950",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
  outline:
    "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
  danger:
    "bg-red-600 text-white hover:bg-red-700 border border-red-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(
  (
    {
      className,
      variant = "default",
      size = "md",
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";