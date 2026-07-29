import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminShell } from "@/components/layout/AdminShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { FormField } from "@/components/common/FormField";
import { AlertBanner } from "@/components/common/AlertBanner";
import { useAdmin } from "@/context/AdminContext";

export default function RoomManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tournaments, saveRoomDetails } = useAdmin();
  const tournament = tournaments.find((t) => t.id === id);

  const [roomId, setRoomId] = useState(tournament?.roomId ?? "");
  const [roomPassword, setRoomPassword] = useState(tournament?.roomPassword ?? "");
  const [roomRevealAt, setRoomRevealAt] = useState(
    tournament?.roomRevealAt ? tournament.roomRevealAt.slice(0, 16) : ""
  );
  const [saved, setSaved] = useState(false);

  if (!tournament) {
    return (
      <AdminShell title="Room Management" showBack hideNav>
        <p className="text-ink-muted text-center py-16">Tournament not found.</p>
      </AdminShell>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saveRoomDetails({
      tournamentId: tournament!.id,
      roomId: roomId.trim(),
      roomPassword: roomPassword.trim(),
      roomRevealAt: roomRevealAt ? new Date(roomRevealAt).toISOString() : "",
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AdminShell title="Room Management" showBack hideNav>
      <GlassCard className="mb-5">
        <p className="label-tag mb-1">Tournament</p>
        <p className="font-display font-bold text-ink">{tournament.title}</p>
      </GlassCard>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {saved && <AlertBanner variant="success" message="Room details saved." />}

        <FormField label="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="123456789" />
        <FormField
          label="Room Password"
          value={roomPassword}
          onChange={(e) => setRoomPassword(e.target.value)}
          placeholder="e.g. ffmax24"
        />
        <FormField
          label="Reveal Time"
          type="datetime-local"
          value={roomRevealAt}
          onChange={(e) => setRoomRevealAt(e.target.value)}
        />
        <p className="text-xs text-ink-muted -mt-2">
          Players will see the Room ID and password on the Tournament Details page once this time
          is reached.
        </p>

        <button type="submit" className="btn-orange">
          Save Room Details
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/tournaments")}
          className="btn-outline-orange"
        >
          Back to Tournaments
        </button>
      </form>
    </AdminShell>
  );
}
