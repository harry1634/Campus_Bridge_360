import { getTpoTeam } from "@/lib/data/tpo-team";
import { TeamClient } from "./team-client";

export default async function TpoTeamPage() {
  const team = await getTpoTeam();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Team</h1>
        <p className="mt-1 text-slate-500">
          Invite fellow placement cell staff. Only existing TPOs can add new TPO accounts —
          there is no public TPO sign-up.
        </p>
      </div>
      <TeamClient team={team} />
    </div>
  );
}
