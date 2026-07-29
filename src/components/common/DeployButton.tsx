import type { ButtonHTMLAttributes } from "react";

interface DeployButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export function DeployButton({
  children,
  loading,
  loadingText = "Deploying...",
  disabled,
  ...rest
}: DeployButtonProps) {
  return (
    <button className="btn-deploy" disabled={disabled || loading} {...rest}>
      {loading ? loadingText : children}
    </button>
  );
}
