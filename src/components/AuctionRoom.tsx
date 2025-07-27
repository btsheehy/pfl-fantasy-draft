import React, { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../hooks/useStore'
import { getPlayerImageUrl } from '../utils'
import { useNavigate } from 'react-router-dom'

const AuctionRoom: React.FC = observer(() => {
  const { auctionStore, playerStore, teamStore, userStore } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    auctionStore.fetchAuctionResults()
  }, [auctionStore])

  const currentAuction = auctionStore.getCurrentAuction()

  useEffect(() => {
    if (currentAuction?.playerId) {
      userStore.fetchUserPlayerNotesForPlayer(currentAuction.playerId)
    }
  }, [currentAuction?.playerId])

  const userNotesOnCurrentAuctionPlayer = currentAuction?.playerId
    ? userStore.playerNotes.get(currentAuction?.playerId)
    : null

  const hydratedCurrentAuction = currentAuction
    ? {
        ...currentAuction,
        player: playerStore.players.find(
          (p) => p.id === currentAuction?.playerId,
        ),
      }
    : null

  const hydratedRecentAuctionResults = auctionStore
    .getRecentAuctionResults()
    .map((result) => {
      return {
        ...result,
        player: playerStore.players.find((p) => p.id === result?.playerId),
        winningTeam: teamStore.teams.find(
          (t) => t.id === result?.winningTeamId,
        ),
      }
    })

  return (
    <div className="space-y-8">
      <h2
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        Auction Room
      </h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6">
          <h3 className="text-xl font-semibold">Current Auction</h3>
        </div>
        <div className="p-6 flex">
          {hydratedCurrentAuction ? (
            <>
              <div className="w-1/3 pr-4">
                <img
                  src={getPlayerImageUrl(
                    hydratedCurrentAuction!.player!.cbssportsId,
                  )}
                  style={{
                    width: '213px',
                    height: '213px',
                  }}
                  alt={hydratedCurrentAuction.player!.name}
                  className="rounded-full object-cover aspect-square cursor-pointer"
                  onClick={() => {
                    navigate(`/player/${hydratedCurrentAuction.player?.id}`)
                  }}
                />
              </div>
              <div className="w-2/3 text-left">
                <div className="flex items-center mb-2">
                  <p
                    className="text-3xl font-bold mr-2 cursor-pointer"
                    onClick={() => {
                      navigate(`/player/${hydratedCurrentAuction.player?.id}`)
                    }}
                  >
                    {hydratedCurrentAuction.player?.name}
                  </p>
                  {userNotesOnCurrentAuctionPlayer?.starred && (
                    <span className="text-yellow-400 text-2xl">★</span>
                  )}
                </div>
                <p className="text-xl mb-2">
                  {hydratedCurrentAuction.player?.position} -{' '}
                  {hydratedCurrentAuction.player?.nflTeam}
                </p>
                <p className="text-lg mb-2">
                  Projected Points:{' '}
                  {hydratedCurrentAuction.player?.projectedFantasyPoints}
                </p>
                <p className="text-lg mb-2">
                  Bye Week: {hydratedCurrentAuction.player?.bye}
                </p>
                {userNotesOnCurrentAuctionPlayer && (
                  <>
                    <p className="text-lg mb-2">
                      My Value:{' '}
                      {userNotesOnCurrentAuctionPlayer.value
                        ? '$' + userNotesOnCurrentAuctionPlayer.value
                        : 'Not set'}
                    </p>
                    <p className="text-lg mb-2">
                      My Notes:{' '}
                      {userNotesOnCurrentAuctionPlayer.notes || 'No notes'}
                    </p>
                  </>
                )}
              </div>
            </>
          ) : (
            <p className="text-xl text-center w-full">
              Waiting for next player...
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6">
          <h3 className="text-xl font-semibold">Recent Auction Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Winning Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Winning Bid
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {hydratedRecentAuctionResults.map((result) => {
                const player = playerStore.players.find(
                  (p) => p.id === result.playerId,
                )
                const team = teamStore.teams.find(
                  (t) => t.id === result.winningTeamId,
                )
                if (!player) return null
                return (
                  <tr key={player.id}>
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => {
                        navigate(`/player/${player.id}`)
                      }}
                    >
                      {player.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {player.position}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => {
                        navigate(`/roster/${team?.id}`)
                      }}
                    >
                      {team?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${result.salary}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
})

export default AuctionRoom
