// components/Roster.tsx
import React, { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../hooks/useStore'
import { useParams, useNavigate } from 'react-router-dom'

import { ApiTeam } from '../services/api'

const Roster: React.FC = observer(() => {
  const { teamId } = useParams<{ teamId: string }>()
  const navigate = useNavigate()
  const { teamStore, userStore } = useStore()
  const [isLoading, setIsLoading] = React.useState(true)

  useEffect(() => {
    if (teamId) {
      setIsLoading(true)
      teamStore.fetchTeamById(parseInt(teamId))
      setIsLoading(false)
    }
  }, [teamId, teamStore.fetchTeamById])

  if (!teamId) {
    return <div>Team not found</div>
  }

  const team = teamStore.getTeamById(parseInt(teamId))
  const teams = teamStore.teams

  const renderRosterSection = (title: string, players: ApiTeam['players']) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6">
        <h3 className="text-xl font-semibold">{title}</h3>
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
                NFL Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contract
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bye
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projected Points
              </th>
              {userStore.godMode && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Starter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PS
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {players
              .sort((a, b) => b.projectedPpg - a.projectedPpg)
              .sort((a, b) => {
                const positionOrder = {
                  QB: 1,
                  RB: 2,
                  WR: 3,
                  TE: 4,
                  DST: 5,
                  K: 6,
                }
                return (
                  positionOrder[a.position as keyof typeof positionOrder] -
                  positionOrder[b.position as keyof typeof positionOrder]
                )
              })
              .map((player) => (
                <tr key={player.cbssportsId}>
                  <td
                    className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => navigate(`/player/${player.playerId}`)}
                  >
                    {player.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.nflTeam}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.contract}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${player.salary?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.bye}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.projectedPpg?.toFixed(1)}
                  </td>
                  {userStore.godMode && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={player.starter}
                          onChange={() => {
                            // TODO: Implement logic to update starter status
                            teamStore.updateContract(
                              parseInt(teamId),
                              player.cbssportsId,
                              {
                                salary: player.salary,
                                starter: !player.starter,
                                injured_reserve: player.injuredReserve,
                                practice_squad: player.practiceSquad,
                              },
                            )
                            console.log(
                              `Toggled starter status for ${player.name}`,
                            )
                          }}
                          className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={!!player.injuredReserve}
                          onChange={() => {
                            teamStore.updateContract(
                              parseInt(teamId),
                              player.cbssportsId,
                              {
                                salary: player.salary,
                                starter: player.starter,
                                injured_reserve: !player.injuredReserve,
                                practice_squad: player.practiceSquad,
                              },
                            )
                          }}
                          className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={!!player.practiceSquad}
                          onChange={() => {
                            teamStore.updateContract(
                              parseInt(teamId),
                              player.cbssportsId,
                              {
                                salary: player.salary,
                                starter: player.starter,
                                injured_reserve: player.injuredReserve,
                                practice_squad: !player.practiceSquad,
                              },
                            )
                          }}
                          className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                        />
                      </td>
                    </>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!team) {
    return <div>Team not found</div>
  }

  const activeRoster = team.players.filter((player) => {
    console.log(player.cbssportsId)
    return player.status === 'active'
  })
  const practiceSquad = team.players.filter(
    (player) => player.status === 'practice',
  )
  const injuredReserve = team.players.filter((player) => player.status === 'IR')

  return (
    <div className="space-y-8">
      <h2
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {team.name} Roster
      </h2>
      <div className="mb-6">
        <select
          className="block w-64 bg-white border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          onChange={(e) => {
            if (e.target.value) {
              navigate(`/roster/${e.target.value}`)
            }
          }}
          value={teamId}
        >
          <option value="">Select a team</option>
          {teams
            .slice()
            .sort((a, b) => {
              if (a.usersTeam) return -1
              if (b.usersTeam) return 1
              return a.name.localeCompare(b.name)
            })
            .map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
        </select>
      </div>
      {renderRosterSection('Active Roster', activeRoster)}
      {renderRosterSection('Practice Squad', practiceSquad)}
      {renderRosterSection('Injured Reserve', injuredReserve)}
    </div>
  )
})

export default Roster
