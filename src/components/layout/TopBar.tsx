import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  title: string;
  showBack?: boolean;
  trailing?: ReactNode;
}

export function TopBar({ title, showBack, trailing }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <div className="top-bar">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="icon-btn"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <h1 className="font-display font-bold text-lg text-ink tracking-wide">{title}</h1>
      </div>
      {trailing}
    </div>
  );
}
