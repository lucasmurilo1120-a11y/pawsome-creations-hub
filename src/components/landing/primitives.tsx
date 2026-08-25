import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/use-reveal";

export const ctaVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold tracking-wide transition-all duration-300 ease-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.985] motion-reduce:transform-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[image:var(--gradient-cta)] text-primary-foreground shadow-[var(--shadow-cta)] hover:scale-[1.025] hover:shadow-[0_16px_38px_-14px_oklch(0.36_0.062_155/0.6)]",
        honey:
          "bg-[image:var(--gradient-honey)] text-cocoa shadow-[var(--shadow-cta)] hover:scale-[1.025]",
        soft: "surface text-foreground hover:scale-[1.02] hover:shadow-[var(--shadow-lift)]",
        ghost: "text-primary hover:bg-accent/60",
      },
      size: {
        sm: "px-5 py-2.5 text-sm",
        md: "px-7 py-3.5 text-[0.95rem]",
        lg: "px-8 py-4 text-base sm:text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Cta({
  className,
  variant,
  size,
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof ctaVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(ctaVariants({ variant, size }), className)} {...props} />;
}

export function Reveal({
  children,
  className,
  delay = 0,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <As
      ref={ref as never}
      className={cn("reveal", visible && "reveal-in", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </As>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-[0.7rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
      {children}
    </span>
  );
}
