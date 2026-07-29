import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { FormField } from "@/components/common/FormField";
import { useAdmin } from "@/context/AdminContext";

type SettingsTab = "app" | "support" | "faq" | "rules";

export default function AdminSettings() {
  const [tab, setTab] = useState<SettingsTab>("app");

  return (
    <AdminShell title="Settings">
      <div className="mb-5">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { label: "App", value: "app" },
            { label: "Support", value: "support" },
            { label: "FAQ", value: "faq" },
            { label: "Rules", value: "rules" },
          ]}
        />
      </div>

      {tab === "app" && <AppSettingsPanel />}
      {tab === "support" && <SupportPanel />}
      {tab === "faq" && <FaqPanel />}
      {tab === "rules" && <RulesPanel />}
    </AdminShell>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-ink">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          value ? "bg-orange" : "bg-white/10"
        }`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-void transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function AppSettingsPanel() {
  const { appSettings, updateAppSettings } = useAdmin();
  return (
    <GlassCard className="divide-y divide-white/10">
      <ToggleRow
        label="Maintenance Mode"
        value={appSettings.maintenanceMode}
        onChange={(v) => updateAppSettings({ maintenanceMode: v })}
      />
      <ToggleRow
        label="Registration Open"
        value={appSettings.registrationOpen}
        onChange={(v) => updateAppSettings({ registrationOpen: v })}
      />
      <div className="pt-4">
        <FormField
          label="Minimum Withdrawal (₹)"
          type="number"
          value={String(appSettings.minWithdrawal)}
          onChange={(e) => updateAppSettings({ minWithdrawal: Number(e.target.value) || 0 })}
        />
      </div>
      <div className="pt-4">
        <FormField
          label="Support Email"
          value={appSettings.supportEmail}
          onChange={(e) => updateAppSettings({ supportEmail: e.target.value })}
        />
      </div>
    </GlassCard>
  );
}

function SupportPanel() {
  const { supportTickets, closeTicket, replyToTicket } = useAdmin();
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  if (supportTickets.length === 0) {
    return <p className="text-sm text-ink-muted text-center py-8">No support tickets.</p>;
  }

  function handleReply(id: string) {
    const reply = replyDrafts[id]?.trim();
    if (!reply) return;
    replyToTicket(id, reply);
    setReplyDrafts((prev) => ({ ...prev, [id]: "" }));
  }

  return (
    <div className="flex flex-col gap-3">
      {supportTickets.map((t) => (
        <GlassCard key={t.id}>
          <div className="flex items-start justify-between mb-1">
            <p className="font-display font-semibold text-ink">{t.subject}</p>
            <Badge variant={t.status === "open" ? "orange" : "muted"}>{t.status}</Badge>
          </div>
          <p className="text-xs text-ink-muted mb-1">{t.username}</p>
          <p className="text-sm text-ink-muted mb-3">{t.message}</p>

          {t.reply && (
            <div className="mb-3 pt-3 border-t border-white/10">
              <p className="text-[11px] font-mono uppercase text-success mb-1">Your Reply</p>
              <p className="text-sm text-ink-muted">{t.reply}</p>
            </div>
          )}

          {t.status === "open" && (
            <div className="flex flex-col gap-2">
              <textarea
                value={replyDrafts[t.id] ?? ""}
                onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [t.id]: e.target.value }))}
                rows={2}
                placeholder="Write a reply..."
                className="field-input resize-none text-sm"
              />
              <div className="flex gap-2">
                <button onClick={() => handleReply(t.id)} className="btn-orange flex-1">
                  Send Reply
                </button>
                <button onClick={() => closeTicket(t.id)} className="btn-outline-orange flex-1">
                  Mark as Closed
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      ))}
    </div>
  );
}

function FaqPanel() {
  const { faqItems, addFaqItem, deleteFaqItem } = useAdmin();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  function handleAdd() {
    if (!question.trim() || !answer.trim()) return;
    addFaqItem({ question: question.trim(), answer: answer.trim() });
    setQuestion("");
    setAnswer("");
  }

  return (
    <div className="flex flex-col gap-4">
      <GlassCard className="flex flex-col gap-3">
        <FormField label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <FormField label="Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        <button onClick={handleAdd} className="btn-orange flex items-center justify-center gap-2">
          <Plus size={16} /> Add FAQ
        </button>
      </GlassCard>

      {faqItems.map((f) => (
        <GlassCard key={f.id} className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{f.question}</p>
            <p className="text-xs text-ink-muted mt-1">{f.answer}</p>
          </div>
          <button
            onClick={() => deleteFaqItem(f.id)}
            className="icon-btn text-danger shrink-0"
            aria-label="Delete FAQ item"
          >
            <Trash2 size={14} />
          </button>
        </GlassCard>
      ))}
    </div>
  );
}

function RulesPanel() {
  const { ruleItems, addRuleItem, deleteRuleItem } = useAdmin();
  const [section, setSection] = useState("");
  const [text, setText] = useState("");

  function handleAdd() {
    if (!section.trim() || !text.trim()) return;
    addRuleItem({ section: section.trim(), text: text.trim() });
    setSection("");
    setText("");
  }

  return (
    <div className="flex flex-col gap-4">
      <GlassCard className="flex flex-col gap-3">
        <FormField label="Section" value={section} onChange={(e) => setSection(e.target.value)} placeholder="Fair Play" />
        <FormField label="Rule Text" value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={handleAdd} className="btn-orange flex items-center justify-center gap-2">
          <Plus size={16} /> Add Rule
        </button>
      </GlassCard>

      {ruleItems.map((r) => (
        <GlassCard key={r.id} className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-mono uppercase text-orange">{r.section}</p>
            <p className="text-sm text-ink-muted mt-1">{r.text}</p>
          </div>
          <button
            onClick={() => deleteRuleItem(r.id)}
            className="icon-btn text-danger shrink-0"
            aria-label="Delete rule item"
          >
            <Trash2 size={14} />
          </button>
        </GlassCard>
      ))}
    </div>
  );
}
