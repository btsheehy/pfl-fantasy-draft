// components/Dashboard.tsx
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../hooks/useStore";

const Dashboard: React.FC = observer(() => {
  const { playerStore, teamStore } = useStore();

  useEffect(() => {
    playerStore.fetchPlayers();
  }, [playerStore]);
  useEffect(() => {
    teamStore.fetchTeams();
  }, [teamStore]);

  const myTeam = teamStore.getMyTeam();

  const topPlayersByPosition = playerStore.getTopPlayersForEachPosition();

  return (
    <div className="space-y-8">
      <h2
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6">
            <h3 className="text-xl font-semibold">My Team Overview</h3>
          </div>
          {myTeam && (
            <div className="p-6">
              <p className="text-lg mb-2">Team Name: {myTeam.name}</p>
              <p className="text-lg mb-2">Projected Points per Game: 117</p>
              <p className="text-lg mb-2">League Rank: 3rd</p>
              <p className="text-lg mb-2">Total Cap: {myTeam.totalCap}</p>
              <p className="text-lg">Remaining Budget: $25</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6">
            <h3 className="text-xl font-semibold">Top Available Players</h3>
          </div>
          <div className="p-6">
            {topPlayersByPosition.map((pos, i) => (
              <ul className={`space-y-2 ${i ? "mt-10" : ""}`}>
                {pos.players.map((player) => (
                  <li className="flex justify-between items-center">
                    <span>
                      {player.name} ({player.position})
                    </span>
                    <span className="bg-yellow-400 text-blue-800 rounded-full py-1 px-3 text-sm font-semibold">
                      {player.projectedFantasyPoints}
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default Dashboard;
