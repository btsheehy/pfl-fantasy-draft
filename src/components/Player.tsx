import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useStore } from '../hooks/useStore'
import { ApiPlayerMetadata } from '../services/api'
import { getPlayerImageUrl } from '../utils'
import { FaStar } from 'react-icons/fa'
import { runInAction } from 'mobx'

const Player: React.FC = observer(() => {
  const { playerId } = useParams<{ playerId: string }>()
  const { playerMetadataStore, userStore } = useStore()
  const [player, setPlayer] = useState<ApiPlayerMetadata | null>(null)
  const [userValue, setUserValue] = useState<number | ''>('')
  const [userNotes, setUserNotes] = useState('')
  const [isStarred, setIsStarred] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (playerId) {
        const metadata = await playerMetadataStore.fetchPlayerMetadata(
          parseInt(playerId),
        )
        setPlayer(metadata || null)

        if (userStore.teamId) {
          const note = await userStore.getPlayerNote(parseInt(playerId))
          if (note) {
            setUserValue(note.value || '')
            setUserNotes(note.notes || '')
            setIsStarred(note.starred || false)
          }
        }
      }
    }
    fetchData()
  }, [playerId, playerMetadataStore, userStore])

  const handleStarToggle = () => {
    if (!player) return
    runInAction(() => {
      const newStarredState = !isStarred
      setIsStarred(newStarredState)
      if (newStarredState) {
        userStore.starPlayer(player.id)
      } else {
        userStore.unstarPlayer(player.id)
      }
    })
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '' : Number(e.target.value)
    setUserValue(value)
    if (player && value !== '') {
      userStore.setPlayerValue(player.id, value)
    }
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserNotes(e.target.value)
    if (player) {
      userStore.setPlayerNotes(player.id, e.target.value)
    }
  }

  if (!player) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden relative">
        <button
          onClick={handleStarToggle}
          className="absolute top-4 right-4 text-3xl text-yellow-400 hover:text-yellow-500"
        >
          <FaStar fill={isStarred ? 'orange' : 'white'} stroke="currentColor" />
        </button>
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center">
          <img
            src={getPlayerImageUrl(player.cbssportsId)}
            alt={player.name}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg mr-4"
          />
          <h1 className="text-3xl font-bold text-white">{player.name}</h1>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            <div className="bg-gray-100 p-2 rounded">
              <p className="text-xs text-gray-600">Position</p>
              <p className="text-sm font-semibold">{player.position}</p>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <p className="text-xs text-gray-600">NFL Team</p>
              <p className="text-sm font-semibold">{player.nflTeam}</p>
            </div>
            {player.position !== 'DST' && (
              <>
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-xs text-gray-600">Height</p>
                  <p className="text-sm font-semibold">{player.height}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-xs text-gray-600">Weight</p>
                  <p className="text-sm font-semibold">{player.weight} lbs</p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-xs text-gray-600">Experience</p>
                  <p className="text-sm font-semibold">
                    {player.experience || 'Rookie'}
                  </p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-xs text-gray-600">Age</p>
                  <p className="text-sm font-semibold">{player.age}</p>
                </div>
              </>
            )}
            <div className="bg-gray-100 p-2 rounded">
              <p className="text-xs text-gray-600">Proj. Points</p>
              <p className="text-sm font-semibold">
                {player.projectedFantasyPoints}
              </p>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <p className="text-xs text-gray-600">SoS</p>
              <p
                className={`text-sm font-semibold ${
                  player.strengthOfSchedule > 19
                    ? 'text-green-500'
                    : player.strengthOfSchedule < 11
                      ? 'text-red-500'
                      : ''
                }`}
              >
                {player.strengthOfSchedule}
              </p>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <p className="text-xs text-gray-600">Last Yr FPPG</p>
              <p className="text-sm font-semibold">
                {player.lastYrFppg || 'N/A'}
              </p>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <p className="text-xs text-gray-600">Bye Week</p>
              <p className="text-sm font-semibold">{player.bye}</p>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <p className="text-xs text-gray-600">Fantasy Team</p>
              <p className="text-sm font-semibold">
                {player.teamName || 'Free Agent'}
              </p>
            </div>
            {player.teamName && (
              <>
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-xs text-gray-600">Contract</p>
                  <p className="text-sm font-semibold">{player.contract}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-xs text-gray-600">Salary</p>
                  <p className="text-sm font-semibold">${player.salary}</p>
                </div>
              </>
            )}
          </div>
          <div className="mt-4 bg-gray-100 p-3 rounded">
            <p className="text-sm text-gray-600">Full Outlook</p>
            <p className="text-base">{player.fullOutlook}</p>
          </div>
          <div className="mt-4 bg-gray-100 p-3 rounded">
            <label className="block text-sm font-medium text-gray-700">
              Your Value
            </label>
            <input
              type="number"
              value={userValue}
              onChange={handleValueChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mt-4 bg-gray-100 p-3 rounded">
            <label className="block text-sm font-medium text-gray-700">
              Your Notes
            </label>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              onBlur={handleNotesChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  )
})

export default Player
