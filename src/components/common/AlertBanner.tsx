interface AlertBannerProps {
  variant: "error" | "success";
  message: string;
}

export function AlertBanner({ variant, message }: AlertBannerProps) {
  const styles =
    variant === "error"
      ? "border-danger/40 bg-danger/10 text-danger"
      : "border-cyan/40 bg-cyan/10 text-cyan";

  return (
    <div role="alert" className={`rounded-md border px-4 py-3 text-sm font-medium ${styles}`}>
      {message}
    </div>
  );
}
