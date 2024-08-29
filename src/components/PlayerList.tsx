// components/PlayerList.tsx
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../hooks/useStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import debounce from "lodash/debounce";

const PlayerList: React.FC = observer(() => {
  const { playerStore, teamStore } = useStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [localSearchTerm, setLocalSearchTerm] = useState(searchParams.get("search") || "");
  const positionFilter = searchParams.get("position") || "All";
  const rookieFilter = searchParams.get("rookies") === "true";
  const availableOnly = searchParams.get("available") === "true";

  const debouncedUpdateSearchParam = useCallback(
    debounce((value: string) => {
      setSearchParams(prev => {
        if (value) {
          prev.set("search", value);
        } else {
          prev.delete("search");
        }
        return prev;
      });
    }, 300),
    [setSearchParams]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredPlayers.length === 1) {
      navigate(`/player/${filteredPlayers[0].id}`);
    }
  };

  // Update the search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    debouncedUpdateSearchParam(value);
  };

  useEffect(() => {
    const searchFromUrl = searchParams.get("search") || "";
    if (searchFromUrl !== localSearchTerm) {
      setLocalSearchTerm(searchFromUrl);
    }
  }, [searchParams]);

  const updateSearchParams = (params: Record<string, string | boolean>) => {
    setSearchParams(prev => {
      Object.entries(params).forEach(([key, value]) => {
        if (value === false || value === "") {
          prev.delete(key);
        } else {
          prev.set(key, String(value));
        }
      });
      return prev;
    });
  };

  const playersOnRosters = useMemo(() => {
    return teamStore.teams.flatMap(team => team.players.map(player => player.playerId));
  }, [teamStore.teams]);

  const filteredPlayers = playerStore.players.filter(
    (player) =>
      (player.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(localSearchTerm.toLowerCase())) &&
      (!availableOnly || !playersOnRosters.includes(player.id)) &&
      (positionFilter === "All" || player.position === positionFilter) &&
      (!rookieFilter || player.experience === 0)
  ).slice(0, 100);

  const positions = ["All", "QB", "RB", "WR", "TE", "K", "DST"];

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
        All Players
      </h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6">
          <input
            type="text"
            placeholder="Search players..."
            className="w-full p-2 rounded text-gray-800 mb-4"
            value={localSearchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          <div className="flex space-x-4 mb-4">
            <select
              value={positionFilter}
              onChange={(e) => updateSearchParams({ position: e.target.value })}
              className="p-2 rounded text-gray-800"
            >
              {positions.map((pos) => (
                <option key={pos} value={pos}>{pos === "All" ? "All Positions" : pos}</option>
              ))}
            </select>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rookieFilter}
                onChange={(e) => updateSearchParams({ rookies: e.target.checked })}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span>Rookies Only</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => updateSearchParams({ available: e.target.checked })}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span>Available Players Only</span>
            </label>
          </div>
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
                  Last Year FPPG
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bye
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NFL Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPlayers.map((player) => (
                <tr key={player.id} >
                  <td className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-200" onClick={() => navigate(`/player/${player.id}`)}>{player.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.projectedFantasyPoints}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.lastYrFppg}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.bye}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.nflTeam}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.experience || 'Rookie'}
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
