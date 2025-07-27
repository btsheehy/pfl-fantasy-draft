import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../hooks/useStore'
import {
  ApiTeam,
  ApiPlayer,
  ApiTeamPlayer,
  API_BASE_URL,
} from '../services/api'

const TradeCenter: React.FC = observer(() => {
  const { teamStore, playerStore } = useStore()
  const [team1, setTeam1] = useState<ApiTeam | null>(null)
  const [team2, setTeam2] = useState<ApiTeam | null>(null)
  const [team1Players, setTeam1Players] = useState<ApiTeamPlayer[]>([])
  const [team2Players, setTeam2Players] = useState<ApiTeamPlayer[]>([])
  const [team1Cap, setTeam1Cap] = useState<{ amount: number; year: number }[]>(
    [],
  )
  const [team2Cap, setTeam2Cap] = useState<{ amount: number; year: number }[]>(
    [],
  )

  const handleTeamChange = (
    teamId: number,
    setTeam: React.Dispatch<React.SetStateAction<ApiTeam | null>>,
  ) => {
    const team = teamStore.getTeamById(teamId)
    setTeam(team || null)
  }

  const handlePlayerSelection = (
    player: ApiTeamPlayer,
    setPlayers: React.Dispatch<React.SetStateAction<ApiTeamPlayer[]>>,
  ) => {
    setPlayers((prevPlayers) =>
      prevPlayers.includes(player)
        ? prevPlayers.filter((p) => p !== player)
        : [...prevPlayers, player],
    )
  }

  const handleCapChange = (
    team: 'team1' | 'team2',
    index: number,
    field: 'amount' | 'year',
    value: number,
  ) => {
    const setCap = team === 'team1' ? setTeam1Cap : setTeam2Cap
    setCap((prevCap) => {
      const newCap = [...prevCap]
      newCap[index] = { ...newCap[index], [field]: value }
      return newCap
    })
  }

  const addCapRow = (team: 'team1' | 'team2') => {
    const setCap = team === 'team1' ? setTeam1Cap : setTeam2Cap
    setCap((prevCap) => [
      ...prevCap,
      { amount: 0, year: new Date().getFullYear() },
    ])
  }

  const handleSubmitTrade = async () => {
    if (team1 && team2) {
      const tradeData = [
        {
          id: team1.id,
          to: team2.id,
          sending: {
            cap: team1Cap,
            players: team1Players.map((p) => ({ cbssports_id: p.cbssportsId })),
          },
        },
        {
          id: team2.id,
          to: team1.id,
          sending: {
            cap: team2Cap,
            players: team2Players.map((p) => ({ cbssports_id: p.cbssportsId })),
          },
        },
      ]
      try {
        await fetch(API_BASE_URL + '/transactions/trade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tradeData),
        })
        alert('Trade submitted successfully')
      } catch (error) {
        console.error('Failed to submit trade:', error)
        alert('Failed to submit trade')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Trade Center</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Team 1</h3>
          <div className="mb-4">
            <label className="block text-gray-700">Select Team</label>
            <select
              onChange={(e) =>
                handleTeamChange(Number(e.target.value), setTeam1)
              }
              className="w-full p-2 border rounded"
            >
              <option value="">Select Team</option>
              {teamStore.teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <h4 className="text-lg font-semibold mb-2">Players</h4>
          {team1?.players.map((player) => (
            <div key={player.playerId} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={team1Players.includes(player)}
                onChange={() => handlePlayerSelection(player, setTeam1Players)}
                className="mr-2"
              />
              {player.name}
            </div>
          ))}
          <h4 className="text-lg font-semibold mb-2">Cap</h4>
          {team1Cap.map((cap, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="number"
                placeholder="Amount"
                value={cap.amount}
                onChange={(e) =>
                  handleCapChange(
                    'team1',
                    index,
                    'amount',
                    Number(e.target.value),
                  )
                }
                className="w-1/2 p-2 border rounded mr-2"
              />
              <input
                type="number"
                placeholder="Year"
                value={cap.year}
                onChange={(e) =>
                  handleCapChange(
                    'team1',
                    index,
                    'year',
                    Number(e.target.value),
                  )
                }
                className="w-1/2 p-2 border rounded"
              />
            </div>
          ))}
          <button
            onClick={() => addCapRow('team1')}
            className="mt-2 bg-blue-600 text-white py-2 px-4 rounded"
          >
            Add Cap
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Team 2</h3>
          <div className="mb-4">
            <label className="block text-gray-700">Select Team</label>
            <select
              onChange={(e) =>
                handleTeamChange(Number(e.target.value), setTeam2)
              }
              className="w-full p-2 border rounded"
            >
              <option value="">Select Team</option>
              {teamStore.teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <h4 className="text-lg font-semibold mb-2">Players</h4>
          {team2?.players.map((player) => (
            <div key={player.playerId} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={team2Players.includes(player)}
                onChange={() => handlePlayerSelection(player, setTeam2Players)}
                className="mr-2"
              />
              {player.name}
            </div>
          ))}
          <h4 className="text-lg font-semibold mb-2">Cap</h4>
          {team2Cap.map((cap, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="number"
                placeholder="Amount"
                value={cap.amount}
                onChange={(e) =>
                  handleCapChange(
                    'team2',
                    index,
                    'amount',
                    Number(e.target.value),
                  )
                }
                className="w-1/2 p-2 border rounded mr-2"
              />
              <input
                type="number"
                placeholder="Year"
                value={cap.year}
                onChange={(e) =>
                  handleCapChange(
                    'team2',
                    index,
                    'year',
                    Number(e.target.value),
                  )
                }
                className="w-1/2 p-2 border rounded"
              />
            </div>
          ))}
          <button
            onClick={() => addCapRow('team2')}
            className="mt-2 bg-blue-600 text-white py-2 px-4 rounded"
          >
            Add Cap
          </button>
        </div>
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={handleSubmitTrade}
          className="bg-green-600 text-white py-2 px-6 rounded"
        >
          Submit Trade
        </button>
      </div>
    </div>
  )
})

export default TradeCenter
