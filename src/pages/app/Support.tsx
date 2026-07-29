import { useEffect, useState, type FormEvent } from "react";
import { MessageCircle, Mail, Send, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { FormField } from "@/components/common/FormField";
import { useAuth } from "@/context/AuthContext";
import { createSupportTicket, subscribeToOwnTickets } from "@/services/supportService";
import type { SupportTicketDoc } from "@/types/firestore";

const CONTACT_OPTIONS = [
  { icon: MessageCircle, label: "Live Chat", detail: "Avg. reply time: 10 min" },
  { icon: Mail, label: "Email Support", detail: "support@ffmaxarena.gg" },
];

export default function Support() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<(SupportTicketDoc & { id: string })[]>([]);

  useEffect(() => {
    if (!user) return;
    return subscribeToOwnTickets(user.uid, setTickets);
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || !user) return;

    setSubmitting(true);
    try {
      await createSupportTicket({
        uid: user.uid,
        username: user.displayName ?? user.email ?? "Player",
        subject: subject.trim(),
        message: message.trim(),
        status: "open",
        createdAt: new Date().toISOString(),
      });
      setSent(true);
      setSubject("");
      setMessage("");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Couldn't submit your ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Support" showBack>
      <SectionHeader title="Contact Options" />
      <div className="grid grid-cols-2 gap-3 mb-6">
        {CONTACT_OPTIONS.map(({ icon: Icon, label, detail }) => (
          <GlassCard key={label} className="flex flex-col items-center text-center gap-2 py-5">
            <Icon size={20} className="text-orange" />
            <p className="text-sm font-semibold text-ink">{label}</p>
            <p className="text-[11px] text-ink-muted font-mono">{detail}</p>
          </GlassCard>
        ))}
      </div>

      <SectionHeader title="Raise a Ticket" />
      <GlassCard className="mb-6">
        {sent ? (
          <div className="text-center py-6">
            <p className="font-display font-semibold text-ink mb-1">Ticket submitted</p>
            <p className="text-sm text-ink-muted mb-4">
              Our team will get back to you at your registered email shortly.
            </p>
            <button onClick={() => setSent(false)} className="btn-outline-orange">
              Raise Another Ticket
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Withdrawal not received"
            />
            <div className="flex flex-col gap-1.5">
              <label className="label-tag" htmlFor="support-message">
                Message
              </label>
              <textarea
                id="support-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Describe the issue in detail..."
                className="field-input resize-none"
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-orange flex items-center justify-center gap-2">
              <Send size={16} />
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        )}
      </GlassCard>

      {tickets.length > 0 && (
        <>
          <SectionHeader title="My Tickets" />
          <div className="flex flex-col gap-3">
            {tickets.map((t) => (
              <GlassCard key={t.id}>
                <div className="flex items-start justify-between mb-1">
                  <p className="font-display font-semibold text-ink">{t.subject}</p>
                  <Badge variant={t.status === "open" ? "orange" : "muted"}>{t.status}</Badge>
                </div>
                <p className="text-sm text-ink-muted mb-2">{t.message}</p>
                {t.reply && (
                  <div className="flex items-start gap-2 pt-2 border-t border-white/10">
                    <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                    <p className="text-sm text-ink">
                      <span className="text-success font-semibold">Support: </span>
                      {t.reply}
                    </p>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
