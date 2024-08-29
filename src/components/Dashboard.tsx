// components/Dashboard.tsx
import React, { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../hooks/useStore'
import { Link } from 'react-router-dom'

const Dashboard: React.FC = observer(() => {
  const { playerStore, teamStore } = useStore()

  useEffect(() => {
    playerStore.fetchPlayers()
  }, [playerStore])
  useEffect(() => {
    teamStore.fetchTeams()
  }, [teamStore])

  const myTeam = teamStore.getMyTeam()
  const allTeams = teamStore.getTeams()
  const otherTeams = allTeams.filter((team) => team.id !== myTeam?.id)

  const topPlayersByPosition = playerStore.getTopPlayersForEachPosition()

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
            <Link to={`/roster/${myTeam?.id}`} className="hover:underline">
              <h3 className="text-xl font-semibold">My Team Overview</h3>
            </Link>
          </div>
          {myTeam && (
            <div className="p-6">
              <p className="text-lg mb-2">Team Name: {myTeam.name}</p>
              <p className="text-lg mb-2">Total Cap: ${myTeam.totalCap}</p>
              <p className="text-lg mb-2">
                Remaining Cap: ${myTeam.availableCap}
              </p>
              <p className="text-lg">
                Cap to spend on one player: ${myTeam.capToSpendOnOnePlayer}
              </p>
            </div>
          )}
        </div>

        {topPlayersByPosition.map((pos) => (
          <div
            key={pos.position}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6">
              <h3 className="text-xl font-semibold">
                Top Available {pos.position}s
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-2">
                {pos.players.map((player) => (
                  <li
                    key={player.id}
                    className="flex justify-between items-center"
                  >
                    <Link
                      to={`/player/${player.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {player.name}
                    </Link>
                    <span className="bg-yellow-400 text-blue-800 rounded-full py-1 px-3 text-sm font-semibold">
                      {player.projectedFantasyPoints}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">Other Teams</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-4">
                <Link to={`/roster/${team.id}`} className="hover:underline">
                  <h4 className="text-lg font-semibold">{team.name}</h4>
                </Link>
              </div>
              <div className="p-4">
                <p className="text-sm mb-1">Total Cap: ${team.totalCap}</p>
                <p className="text-sm mb-1">
                  Remaining Cap: ${team.availableCap}
                </p>
                <p className="text-sm">
                  Cap to spend on one player: ${team.capToSpendOnOnePlayer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

export default Dashboard
