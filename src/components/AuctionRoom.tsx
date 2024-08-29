import React from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../hooks/useStore'
import { getPlayerImageUrl } from '../utils'

const AuctionRoom: React.FC = observer(() => {
  const { auctionStore, playerStore, teamStore } = useStore()

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
          {auctionStore.currentAuction ? (
            <>
              <div className="w-1/3 pr-4">
                <img
                  src={getPlayerImageUrl(
                    auctionStore.currentAuction!.player!.cbssportsId,
                  )}
                  alt={auctionStore.currentAuction.player!.name}
                  className="w-full h-auto rounded-full object-cover aspect-square"
                />
              </div>
              <div className="w-2/3 text-left">
                <p className="text-3xl font-bold mb-2">
                  {auctionStore.currentAuction.player?.name}
                </p>
                <p className="text-xl mb-2">
                  {auctionStore.currentAuction.player?.position} -{' '}
                  {auctionStore.currentAuction.player?.nflTeam}
                </p>
                <p className="text-lg mb-4">
                  Projected Points:{' '}
                  {auctionStore.currentAuction.player?.projectedFantasyPoints}
                </p>
                <p className="text-lg mb-4">
                  Nominating Team:{' '}
                  {auctionStore.currentAuction.nominatingTeam?.name}
                </p>
                <p className="text-lg mb-4">
                  Initial Bid: ${auctionStore.currentAuction.initialBid}
                </p>
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
              {auctionStore.auctionResults.map((result) => {
                const player = playerStore.players.find(
                  (p) => p.id === result.playerId,
                )
                const team = teamStore.teams.find(
                  (t) => t.id === result.winningTeamId,
                )
                if (!player) return null
                return (
                  <tr key={player.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {player.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {player.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
