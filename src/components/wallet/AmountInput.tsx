interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  quickAmounts?: number[];
}

export function AmountInput({ value, onChange, quickAmounts = [50, 100, 200, 500] }: AmountInputProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted font-display font-bold">
          ₹
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Enter amount"
          className="field-input pl-8 font-display font-bold text-lg"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => onChange(String(amt))}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold font-mono border transition-colors ${
              value === String(amt)
                ? "bg-orange text-void border-orange"
                : "bg-white/5 text-ink-muted border-white/10 hover:border-white/20"
            }`}
          >
            ₹{amt}
          </button>
        ))}
      </div>
    </div>
  );
}
