import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { subscribeToFaqItems } from "@/services/contentService";
import { MOCK_FAQ } from "@/mock/content";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [live, setLive] = useState<{ question: string; answer: string }[] | null>(null);

  useEffect(() => {
    return subscribeToFaqItems((items) => {
      setLive(items.length > 0 ? items : null);
    });
  }, []);

  const items = live ?? MOCK_FAQ;

  return (
    <AppShell title="FAQ" showBack>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <GlassCard key={item.question} padded={false}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-ink">{item.question}</span>
                <ChevronDown
                  size={18}
                  className={`text-orange shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-sm text-ink-muted px-5 pb-4 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </AppShell>
  );
}
