// components/PlayerList.tsx
import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../hooks/useStore";

const PlayerList: React.FC = observer(() => {
  const { playerStore } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    playerStore.fetchPlayers();
  }, [playerStore]);

  const filteredPlayers = playerStore.players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (playerStore.isLoading) {
    return <div>Loading players...</div>;
  }

  if (playerStore.error) {
    return <div>Error: {playerStore.error}</div>;
  }

  return (
    <div className="space-y-8">
      <h2
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        Available Players
      </h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6">
          <input
            type="text"
            placeholder="Search players..."
            className="w-full p-2 rounded text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projected Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SoS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Year FPPG
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPlayers.map((player) => (
                <tr key={player.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{player.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.projectedFantasyPoints}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.strengthOfSchedule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.lastYrFppg}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="bg-yellow-400 text-blue-800 rounded py-1 px-3 text-sm font-semibold hover:bg-yellow-500 transition duration-200">
                      Add to Watchlist
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default PlayerList;
