interface TabsProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

export function Tabs<T extends string>({ options, value, onChange }: TabsProps<T>) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold font-display
              border transition-all duration-200 ${
                isActive
                  ? "bg-orange text-void border-orange shadow-glow-orange"
                  : "bg-white/5 text-ink-muted border-white/10 hover:border-white/20"
              }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
