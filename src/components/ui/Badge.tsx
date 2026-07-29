type BadgeVariant = "orange" | "muted" | "success" | "danger";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  orange: "chip-orange",
  muted: "chip-muted",
  success: "chip-success",
  danger: "chip-danger",
};

export function Badge({ children, variant = "muted" }: BadgeProps) {
  return <span className={VARIANT_CLASS[variant]}>{children}</span>;
}
