import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/20 text-primary",
        outline: "border-white/20 text-foreground",
        success: "border-transparent bg-aqi-good/20 text-aqi-good",
        warning: "border-transparent bg-aqi-sensitive/20 text-aqi-sensitive",
        danger: "border-transparent bg-aqi-severe/20 text-aqi-severe",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, style, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} style={style} {...props} />;
}

export { Badge, badgeVariants };
