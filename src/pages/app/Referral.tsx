import { useEffect, useState, type FormEvent } from "react";
import { Copy, Check, Share2, Users2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { FormField } from "@/components/common/FormField";
import { AlertBanner } from "@/components/common/AlertBanner";
import { useAuth } from "@/context/AuthContext";
import { subscribeToReferralProfile, subscribeToReferredUsers } from "@/services/referralService";
import { callRedeemReferralCode } from "@/services/functionsService";
import { MOCK_REFERRAL } from "@/mock/referral";
import type { UserDoc, ReferralRedemptionDoc } from "@/types/firestore";

const REFERRAL_BONUS = 50; // must match REFERRAL_BONUS in functions/src/payments/approvePayment.ts

export default function Referral() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [referredUsers, setReferredUsers] = useState<(ReferralRedemptionDoc & { id: string })[]>([]);
  const [copied, setCopied] = useState(false);

  const [redeemCode, setRedeemCode] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubProfile = subscribeToReferralProfile(user.uid, setProfile);
    const unsubReferred = subscribeToReferredUsers(user.uid, setReferredUsers);
    return () => {
      unsubProfile();
      unsubReferred();
    };
  }, [user]);

  // The trigger that generates a code fires right after signup — there's
  // a brief window where it hasn't landed yet. Fall back to the mock
  // code purely for display continuity during that window / while
  // Firestore is still loading, never for an actual redeemable value.
  const code = profile?.referralCode ?? MOCK_REFERRAL.code;
  const shareLink = `${window.location.origin}/signup?ref=${code}`;
  const totalReferred = profile?.totalReferred ?? 0;
  const totalEarned = profile?.totalReferralEarnings ?? 0;

  function handleCopy() {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function handleShare() {
    const shareData = {
      title: "Join me on FF MAX ARENA",
      text: `Use my referral code ${code} when you join FF MAX ARENA!`,
      url: shareLink,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareLink).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  async function handleRedeem(e: FormEvent) {
    e.preventDefault();
    setRedeemError("");
    if (!redeemCode.trim()) return;

    setRedeeming(true);
    try {
      await callRedeemReferralCode(redeemCode.trim());
      setRedeemSuccess(true);
      setRedeemCode("");
    } catch (error) {
      setRedeemError(error instanceof Error ? error.message : "Couldn't redeem that code.");
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <AppShell title="Referral Program" showBack>
      <GlassCard className="mb-5 text-center py-7">
        <p className="label-tag mb-2">Your Referral Code</p>
        <p className="font-display font-black text-3xl text-orange tracking-widest mb-4">
          {code}
        </p>
        <div className="flex gap-3">
          <button onClick={handleCopy} className="btn-outline-orange flex items-center justify-center gap-2">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy Code"}
          </button>
          <button onClick={handleShare} className="btn-orange flex items-center justify-center gap-2">
            <Share2 size={16} />
            Share
          </button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <GlassCard className="text-center">
          <p className="label-tag mb-1">Friends Joined</p>
          <p className="font-display font-bold text-2xl text-ink">{totalReferred}</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="label-tag mb-1">Total Earned</p>
          <p className="font-display font-bold text-2xl text-orange">₹{totalEarned}</p>
        </GlassCard>
      </div>

      <GlassCard className="mb-6 flex items-center gap-3">
        <Users2 size={18} className="text-orange shrink-0" />
        <p className="text-sm text-ink-muted">
          Earn ₹{REFERRAL_BONUS} when a friend signs up with your code and joins their first paid
          tournament.
        </p>
      </GlassCard>

      {!profile?.referredBy && (
        <GlassCard className="mb-6">
          <p className="label-tag mb-3">Have a referral code?</p>
          {redeemSuccess ? (
            <AlertBanner variant="success" message="Referral code redeemed! Your referrer will be rewarded once you join your first tournament." />
          ) : (
            <form onSubmit={handleRedeem} className="flex flex-col gap-3">
              {redeemError && <AlertBanner variant="error" message={redeemError} />}
              <FormField
                label="Referral Code"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                placeholder="e.g. RAAJ2026"
              />
              <button type="submit" disabled={redeeming} className="btn-outline-orange">
                {redeeming ? "Redeeming..." : "Redeem Code"}
              </button>
            </form>
          )}
        </GlassCard>
      )}

      <SectionHeader title="Referred Players" />
      {referredUsers.length === 0 ? (
        <p className="text-sm text-ink-muted text-center py-6">
          No referrals yet — share your code to get started.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {referredUsers.map((u) => (
            <GlassCard key={u.id} className="flex items-center justify-between !py-3.5">
              <div>
                <p className="text-sm font-semibold text-ink">{u.username}</p>
                <p className="text-[11px] text-ink-muted font-mono">Joined {u.joinedDate}</p>
              </div>
              <Badge variant={u.bonusCredited ? "success" : "muted"}>
                {u.bonusCredited ? "Bonus credited" : "Pending"}
              </Badge>
            </GlassCard>
          ))}
        </div>
      )}
    </AppShell>
  );
}
