import { cn } from "@/lib/utils";

const variants = {
  default: "bg-muted text-muted-foreground",
  success: "bg-green-500/15 text-green-500 border-green-500/20",
  warning: "bg-yellow-500/15 text-yellow-500 border-yellow-500/20",
  error: "bg-red-500/15 text-red-500 border-red-500/20",
  info: "bg-blue-500/15 text-blue-500 border-blue-500/20",
  primary: "bg-primary/15 text-primary border-primary/20",
};

interface StatusBadgeProps {
  status: string;
  variant?: keyof typeof variants;
  className?: string;
}

export function StatusBadge({ status, variant = "default", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium border ring-1 ring-inset ring-transparent capitalize",
        variants[variant],
        className
      )}
    >
      {status.toLowerCase().replace("_", " ")}
    </span>
  );
}
