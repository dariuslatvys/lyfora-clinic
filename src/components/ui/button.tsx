import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "soft";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50",
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2.5 text-sm",
          size === "lg" && "px-5 py-3 text-base",
          variant === "primary" &&
            "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]",
          variant === "ghost" &&
            "bg-transparent text-[var(--ink)] hover:bg-[var(--surface-2)]",
          variant === "outline" &&
            "border border-[var(--line)] bg-[var(--surface-raised)] text-[var(--ink)] hover:bg-[var(--surface-2)]",
          variant === "soft" &&
            "bg-[var(--accent-soft)] text-[var(--accent-strong)] hover:bg-[var(--accent-soft-2)]",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
