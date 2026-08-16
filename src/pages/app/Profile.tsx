import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  Trophy,
  Users2,
  Gift,
  FileText,
  HelpCircle,
  MessageCircle,
  LogOut,
  ChevronRight,
  Gamepad2,
  ShieldCheck,
  Camera,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatPill } from "@/components/ui/StatPill";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/context/AuthContext";
import { MOCK_PROFILE } from "@/mock/content";
import { uploadFile, buildAvatarPath } from "@/services/storageService";
import { updateAuthProfile } from "@/services/authService";
import { updateUserProfile } from "@/services/usersService";

const BASE_MENU_ITEMS = [
  { label: "Match History", icon: History, to: "/matches" },
  { label: "Winner History", icon: Trophy, to: "/winners" },
  { label: "Referral Program", icon: Users2, to: "/referral" },
  { label: "Daily Rewards", icon: Gift, to: "/rewards" },
  { label: "Rules", icon: FileText, to: "/rules" },
  { label: "FAQ", icon: HelpCircle, to: "/faq" },
  { label: "Support", icon: MessageCircle, to: "/support" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  console.log("[Admin Debug] Profile role:", role);
  console.log("[Admin Debug] Profile UID:", user?.uid);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const menuItems =
    role === "admin"
      ? [...BASE_MENU_ITEMS, { label: "Admin Panel", icon: ShieldCheck, to: "/admin" }]
      : BASE_MENU_ITEMS;

  async function handlePhotoSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const path = buildAvatarPath(user.uid, file);
      const downloadUrl = await uploadFile(path, file);
      await updateAuthProfile({ photoURL: downloadUrl });
      await updateUserProfile(user.uid, { photoURL: downloadUrl });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[Profile] Photo upload failed:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <AppShell title="Profile">
      <GlassCard className="mb-5 flex items-center gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative w-16 h-16 rounded-full shrink-0 group"
          aria-label="Change profile photo"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" decoding="async" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange to-orange-deep flex items-center justify-center font-display font-black text-void text-2xl">
              {(user?.displayName ?? MOCK_PROFILE.displayName).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-void/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera size={16} className="text-ink" />
          </div>
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-void/70 flex items-center justify-center">
              <span className="w-4 h-4 border-2 border-orange border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelected}
        />

        <div className="min-w-0">
          <p className="font-display font-bold text-lg text-ink truncate">
            {user?.displayName ?? MOCK_PROFILE.displayName}
          </p>
          <p className="text-xs text-ink-muted font-mono flex items-center gap-1 truncate">
            <Gamepad2 size={12} /> {MOCK_PROFILE.inGameName} · UID {MOCK_PROFILE.inGameUid}
          </p>
          <p className="text-xs text-orange font-mono mt-1">Level {MOCK_PROFILE.level}</p>
        </div>
      </GlassCard>

      <GlassCard className="mb-6 flex divide-x divide-white/10">
        <StatPill label="Matches" value={MOCK_PROFILE.matchesPlayed} />
        <StatPill label="Wins" value={MOCK_PROFILE.wins} accent />
        <StatPill label="Win Rate" value={`${MOCK_PROFILE.winRate}%`} />
        <StatPill label="K/D" value={MOCK_PROFILE.kdRatio} />
      </GlassCard>

      <p className="text-xs text-orange font-mono mb-2">DEBUG ROLE: {role ?? "null"}</p>
      <SectionHeader title="More" />
      <GlassCard padded={false} className="mb-6 divide-y divide-white/10 overflow-hidden">
        {menuItems.map(({ label, icon: Icon, to }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-3 text-sm text-ink font-medium">
              <Icon size={18} className="text-orange" />
              {label}
            </span>
            <ChevronRight size={18} className="text-ink-muted" />
          </button>
        ))}
      </GlassCard>

      <button
        onClick={() => logout()}
        className="w-full flex items-center justify-center gap-2 text-danger font-display font-semibold py-3"
      >
        <LogOut size={18} />
        Log Out
      </button>
    </AppShell>
  );
}
