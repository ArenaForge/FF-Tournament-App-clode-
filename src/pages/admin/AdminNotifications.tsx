import { useState, type FormEvent } from "react";
import { Send, Users2, User } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FormField } from "@/components/common/FormField";
import { Tabs } from "@/components/ui/Tabs";
import { AlertBanner } from "@/components/common/AlertBanner";
import { useAdmin } from "@/context/AdminContext";

type Audience = "all" | "selected";

export default function AdminNotifications() {
  const { users, sentNotifications, sendNotification } = useAdmin();
  const [audience, setAudience] = useState<Audience>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sentMessage, setSentMessage] = useState("");

  function toggleUser(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    if (audience === "selected" && selectedIds.length === 0) return;

    try {
      const recipientCount = await sendNotification(title.trim(), body.trim(), audience, selectedIds);
      setSentMessage(`Sent to ${recipientCount} user${recipientCount === 1 ? "" : "s"}.`);
      setTitle("");
      setBody("");
      setSelectedIds([]);
      setTimeout(() => setSentMessage(""), 2500);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Failed to send notification.");
    }
  }

  return (
    <AdminShell title="Notifications">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-8">
        {sentMessage && <AlertBanner variant="success" message={sentMessage} />}

        <div>
          <p className="label-tag mb-2">Audience</p>
          <Tabs
            value={audience}
            onChange={setAudience}
            options={[
              { label: "All Users", value: "all" },
              { label: "Selected Users", value: "selected" },
            ]}
          />
        </div>

        {audience === "selected" && (
          <GlassCard padded={false} className="max-h-56 overflow-y-auto divide-y divide-white/10">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => toggleUser(u.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <span className="flex items-center gap-2 text-sm text-ink">
                  <User size={14} className="text-ink-muted" />
                  {u.username}
                </span>
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selectedIds.includes(u.id) ? "bg-orange border-orange" : "border-white/20"
                  }`}
                />
              </button>
            ))}
          </GlassCard>
        )}

        <FormField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New tournament live!" />

        <div className="flex flex-col gap-1.5">
          <label className="label-tag" htmlFor="notif-body">
            Message
          </label>
          <textarea
            id="notif-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Write your notification message..."
            className="field-input resize-none"
          />
        </div>

        <button type="submit" className="btn-orange flex items-center justify-center gap-2">
          <Send size={16} />
          Send Notification
        </button>
      </form>

      <SectionHeader title="Sent History" />
      {sentNotifications.length === 0 ? (
        <p className="text-sm text-ink-muted text-center py-8">No notifications sent yet.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sentNotifications.map((n) => (
            <GlassCard key={n.id} className="!py-3.5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-ink">{n.title}</p>
                <span className="flex items-center gap-1 text-[11px] text-ink-muted font-mono shrink-0">
                  <Users2 size={11} /> {n.recipientCount}
                </span>
              </div>
              <p className="text-xs text-ink-muted">{n.body}</p>
            </GlassCard>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
