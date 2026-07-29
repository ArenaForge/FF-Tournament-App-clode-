import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { FormField } from "@/components/common/FormField";
import { Tabs } from "@/components/ui/Tabs";
import { useAdmin } from "@/context/AdminContext";
import { uploadFile, buildTournamentBannerPath } from "@/services/storageService";
import type { TournamentMode, TournamentType, TournamentStatus } from "@/mock/tournaments";

const BANNER_PRESETS = [
  { key: "from-orange/30 via-void to-void", label: "Orange" },
  { key: "from-amber/20 via-void to-void", label: "Amber" },
  { key: "from-success/20 via-void to-void", label: "Green" },
];

export default function TournamentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tournaments, createTournament, updateTournament } = useAdmin();
  const isEdit = Boolean(id);
  const existing = isEdit ? tournaments.find((t) => t.id === id) : undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [type, setType] = useState<TournamentType>(existing?.type ?? "CS");
  const [mode, setMode] = useState<TournamentMode>(existing?.mode ?? "squad");
  const [map, setMap] = useState(existing?.map ?? "");
  const [entryFee, setEntryFee] = useState(String(existing?.entryFee ?? ""));
  const [prizePool, setPrizePool] = useState(String(existing?.prizePool ?? ""));
  const [perKill, setPerKill] = useState(String(existing?.perKill ?? "0"));
  const [slotsTotal, setSlotsTotal] = useState(String(existing?.slotsTotal ?? ""));
  const [startTime, setStartTime] = useState(
    existing?.startTime ? existing.startTime.slice(0, 16) : ""
  );
  const [status, setStatus] = useState<TournamentStatus>(existing?.status ?? "upcoming");
  const [banner, setBanner] = useState(existing?.banner ?? BANNER_PRESETS[0].key);
  const [bannerUrl, setBannerUrl] = useState(existing?.bannerUrl ?? "");

  async function handleBannerSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const tournamentIdForPath = existing?.id ?? `draft-${Date.now()}`;
      const path = buildTournamentBannerPath(tournamentIdForPath, file);
      const downloadUrl = await uploadFile(path, file);
      setBannerUrl(downloadUrl);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[TournamentForm] Banner upload failed:", error);
    } finally {
      setUploadingBanner(false);
      e.target.value = "";
    }
  }

  if (isEdit && !existing) {
    return (
      <AdminShell title="Edit Tournament" showBack hideNav>
        <p className="text-ink-muted text-center py-16">Tournament not found.</p>
      </AdminShell>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      title: title.trim(),
      type,
      mode,
      map: map.trim(),
      entryFee: Number(entryFee) || 0,
      prizePool: Number(prizePool) || 0,
      perKill: Number(perKill) || 0,
      slotsTotal: Number(slotsTotal) || 0,
      startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
      status,
      banner,
      bannerUrl: bannerUrl || undefined,
    };

    if (isEdit && existing) {
      updateTournament(existing.id, payload);
    } else {
      createTournament({ ...payload, slotsTotal: payload.slotsTotal });
    }
    navigate("/admin/tournaments");
  }

  return (
    <AdminShell title={isEdit ? "Edit Tournament" : "Create Tournament"} showBack hideNav>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-6">
        <FormField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Clash Squad Blitz #25" />

        <div>
          <p className="label-tag mb-2">Type</p>
          <Tabs
            value={type}
            onChange={setType}
            options={[
              { label: "Clash Squad", value: "CS" },
              { label: "Battle Royale", value: "BR" },
            ]}
          />
        </div>

        <div>
          <p className="label-tag mb-2">Mode</p>
          <Tabs
            value={mode}
            onChange={setMode}
            options={[
              { label: "Solo", value: "solo" },
              { label: "Duo", value: "duo" },
              { label: "Squad", value: "squad" },
            ]}
          />
        </div>

        <FormField label="Map" value={map} onChange={(e) => setMap(e.target.value)} placeholder="Bermuda" />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Entry Fee (₹)" type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} />
          <FormField label="Prize Pool (₹)" type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Per Kill (₹)" type="number" value={perKill} onChange={(e) => setPerKill(e.target.value)} />
          <FormField label="Total Slots" type="number" value={slotsTotal} onChange={(e) => setSlotsTotal(e.target.value)} />
        </div>

        <FormField
          label="Start Date & Time"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <div>
          <p className="label-tag mb-2">Status</p>
          <Tabs
            value={status}
            onChange={setStatus}
            options={[
              { label: "Upcoming", value: "upcoming" },
              { label: "Live", value: "live" },
              { label: "Completed", value: "completed" },
            ]}
          />
        </div>

        <div>
          <p className="label-tag mb-2">Banner</p>
          <div className="flex gap-3 mb-3">
            {BANNER_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => {
                  setBanner(preset.key);
                  setBannerUrl("");
                }}
                className={`flex-1 h-14 rounded-xl bg-gradient-to-br ${preset.key} border-2 transition-all ${
                  banner === preset.key && !bannerUrl ? "border-orange" : "border-white/10"
                }`}
                aria-label={`Select ${preset.label} banner`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingBanner}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-sm text-ink-muted hover:text-ink hover:border-white/20 transition-colors disabled:opacity-50"
          >
            <ImagePlus size={15} />
            {uploadingBanner ? "Uploading..." : bannerUrl ? "Replace Uploaded Banner" : "Upload Banner Image"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerSelected}
          />

          <p className="text-xs text-ink-muted mt-2">
            Use a preset gradient, or upload a real banner image (stored in Firebase Storage).
          </p>
        </div>

        <GlassCard className={`relative h-16 overflow-hidden bg-gradient-to-br ${banner}`}>
          {bannerUrl && (
            <img src={bannerUrl} alt="" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          )}
        </GlassCard>

        <button type="submit" className="btn-orange">
          {isEdit ? "Save Changes" : "Create Tournament"}
        </button>
      </form>
    </AdminShell>
  );
}
