import { useMemo, useState } from "react";
import { Swords } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs } from "@/components/ui/Tabs";
import { SearchInput } from "@/components/ui/SearchInput";
import { TournamentCard } from "@/components/tournament/TournamentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTournaments } from "@/context/TournamentContext";
import type { TournamentMode, TournamentType, TournamentStatus } from "@/mock/tournaments";

type TypeFilter = TournamentType | "ALL";
type ModeFilter = TournamentMode | "all";
type StatusFilter = TournamentStatus | "all";

export default function TournamentList() {
  const { tournaments } = useTournaments();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeFilter>("ALL");
  const [mode, setMode] = useState<ModeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tournaments
      .filter((t) => {
        const typeMatch = type === "ALL" || t.type === type;
        const modeMatch = mode === "all" || t.mode === mode;
        const statusMatch = status === "all" || t.status === status;
        const searchMatch =
          query.length === 0 ||
          t.title.toLowerCase().includes(query) ||
          t.map.toLowerCase().includes(query);
        return typeMatch && modeMatch && statusMatch && searchMatch;
      })
      .sort((a) => (a.status === "live" ? -1 : 1));
  }, [tournaments, search, type, mode, status]);

  return (
    <AppShell title="Tournaments">
      <div className="flex flex-col gap-3 mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or map..." />

        <Tabs
          value={type}
          onChange={setType}
          options={[
            { label: "All", value: "ALL" },
            { label: "Clash Squad", value: "CS" },
            { label: "Battle Royale", value: "BR" },
          ]}
        />
        <Tabs
          value={mode}
          onChange={setMode}
          options={[
            { label: "All Modes", value: "all" },
            { label: "Solo", value: "solo" },
            { label: "Duo", value: "duo" },
            { label: "Squad", value: "squad" },
          ]}
        />
        <Tabs
          value={status}
          onChange={setStatus}
          options={[
            { label: "All Status", value: "all" },
            { label: "Live", value: "live" },
            { label: "Upcoming", value: "upcoming" },
            { label: "Completed", value: "completed" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Swords size={26} />}
          title="No tournaments found"
          message="Try a different search or filter combination, or check back soon for new matches."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
