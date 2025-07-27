import React, { useState, useEffect, useMemo, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../hooks/useStore'
import { GodModeGate } from './SecurityComponents'
import { ApiPlayer } from '../services/api'
import { getPlayerImageUrl } from '../utils'
import { Link } from 'react-router-dom'

const CommandCenter: React.FC = observer(() => {
  const {
    playerStore,
    teamStore,
    auctionStore,
    playerMetadataStore,
    userStore,
  } = useStore()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<ApiPlayer[]>([])
  const rosteredPlayerIds = teamStore.getLeagueRosteredPlayerIds()

  const currentAuction = auctionStore.getCurrentAuction()

  useEffect(() => {
    auctionStore.fetchAuctionResults()
  }, [auctionStore])

  useEffect(() => {
    if (currentAuction?.playerId) {
      playerMetadataStore.fetchPlayerMetadata(currentAuction.playerId)
    }
    setSearchResults([])
    setSearchQuery('')
  }, [currentAuction?.playerId])

  const hydratedCurrentAuction = currentAuction
    ? {
        ...currentAuction,
        player: playerMetadataStore.getPlayerMetadata(currentAuction.playerId),
      }
    : null

  const availablePlayers = useMemo(
    () =>
      playerStore.players.filter(
        (player) => !rosteredPlayerIds.includes(player.id),
      ),
    [playerStore.players, rosteredPlayerIds],
  )

  const availablePlayersWithSearchStrings = useMemo(
    () =>
      availablePlayers.map((player) => ({
        ...player,
        searchString: player.name.replace(/[^a-zA-Z]/g, '').toLowerCase(),
      })),
    [availablePlayers],
  )

  const playersInTier = useMemo(() => {
    return playerStore.players
      .filter(
        (player) =>
          (player.projTier === hydratedCurrentAuction?.player?.projTier ||
            (player.projTier !== undefined &&
              hydratedCurrentAuction?.player?.projTier !== undefined &&
              player.projTier < 2 &&
              hydratedCurrentAuction.player.projTier < 2)) &&
          player.position === hydratedCurrentAuction?.player?.position,
      )
      .map((p) => ({ ...p, isAvailable: !rosteredPlayerIds.includes(p.id) }))
      .sort((a, b) => b.projectedFantasyPoints - a.projectedFantasyPoints)
  }, [
    playerStore.players,
    hydratedCurrentAuction?.player?.projTier,
    hydratedCurrentAuction?.player?.position,
  ])

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const results = availablePlayersWithSearchStrings.filter((player) =>
      player.searchString.includes(
        searchQuery.replace(/[^a-zA-Z]/g, '').toLowerCase(),
      ),
    )
    if (results.length === 1) {
      return auctionStore.setNewAuction(results[0].id)
    } else setSearchResults(results)
  }

  const [bidAmount, setBidAmount] = useState(0)
  const [winningBidder, setWinningBidder] = useState('')
  const winningBidderInfo = teamStore.teams.find(
    (t) => t.name === winningBidder,
  )
  const eraseWinningBidder = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') return setWinningBidder('')
    if (e.key === 'Enter') {
      handleSubmitAuctionResult()
      setBidAmount(0)
      setWinningBidder('')
    }
  }
  const prepString = (s: string) => s.toUpperCase().replace(/ |'|\./g, '')
  const handleWinningBidderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = e.currentTarget.value
    const potentialMatches = teamStore.teams.filter((t) =>
      prepString(t.name).includes(prepString(input)),
    )
    if (potentialMatches.length === 1)
      return setWinningBidder(potentialMatches[0].name)
    return setWinningBidder(input)
  }

  const handleSubmitAuctionResult = async (
    e?: React.FormEvent<HTMLFormElement>,
  ) => {
    e?.preventDefault()
    if (winningBidderInfo && bidAmount && hydratedCurrentAuction) {
      if (winningBidderInfo.capToSpendOnOnePlayer < bidAmount) {
        return alert('Bid amount is greater than the available cap')
      }
      try {
        await auctionStore.updateAuction(
          hydratedCurrentAuction.id,
          winningBidderInfo.id,
          Number(bidAmount),
        )
        setWinningBidder('')
        setBidAmount(0)
      } catch (error) {
        console.error('Failed to update auction:', error)
      }
    }
  }

  const renderPlayerTiers = () => {
    // TODO: Implement player tiers display
    return <div>Player Tiers</div>
  }

  const renderPredictedPrices = () => {
    // TODO: Implement predicted prices display
    return <div>Predicted Prices</div>
  }

  const renderOptimalRosters = () => {
    // TODO: Implement optimal roster combinations display
    return <div>Optimal Rosters</div>
  }

  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(-1)
  const searchResultsRef = useRef<HTMLUListElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedResultIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev,
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedResultIndex((prev) => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
        e.preventDefault()
        auctionStore.setNewAuction(searchResults[selectedResultIndex].id)
      }
    }
  }

  useEffect(() => {
    if (searchResultsRef.current && selectedResultIndex >= 0) {
      const selectedElement = searchResultsRef.current.children[
        selectedResultIndex
      ] as HTMLElement
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedResultIndex])

  const myTeam = teamStore.getMyTeam()
  const myRosterPlayers = useMemo(() => {
    if (!myTeam || !hydratedCurrentAuction?.player) return []

    return myTeam.players
      .filter(
        (player) => player.position === hydratedCurrentAuction.player?.position,
      )
      .map((player) => ({
        ...player,
        hasSameByeWeek: player.bye === hydratedCurrentAuction.player?.bye,
      }))
  }, [myTeam, hydratedCurrentAuction])

  return (
    <GodModeGate FallbackComponent={() => <div>Access Denied</div>}>
      <div className="flex min-h-screen bg-gray-100">
        <div className="w-1/4 py-4 bg-gray-100">
          {hydratedCurrentAuction?.player && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="text-xl font-semibold mb-4">Players in Tier</h3>
              <p className="mb-2">
                {hydratedCurrentAuction.player.position} - Tier{' '}
                {hydratedCurrentAuction.player.projTier}
              </p>
              <ul className="space-y-2">
                {playersInTier.map((player) => (
                  <Link to={`/player/${player.id}`} key={player.id}>
                    <li
                      className={`p-2 rounded ${
                        player.isAvailable ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      <span className="font-semibold">{player.name}</span>
                      <span className="ml-2 text-sm text-gray-600">
                        {player.projectedFantasyPoints} pts
                      </span>
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
          )}
          {/* You can add more content or cards here in the left column */}
        </div>
        <div className="w-1/2 p-4">
          <div className="w-full max-w-3xl">
            {!auctionStore.getCurrentAuction() && (
              <>
                <form onSubmit={handleSearchSubmit} className="mb-8">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a player..."
                    className="w-full p-4 text-xl border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-300"
                  />
                </form>
                {searchResults.length > 1 && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-700">
                      Search Results:
                    </h3>
                    <ul className="space-y-3">
                      {searchResults.map((player) => (
                        <li
                          key={player.id}
                          className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition duration-300"
                          onClick={() => auctionStore.setNewAuction(player.id)}
                        >
                          <span className="font-semibold">{player.name}</span>
                          <span className="text-gray-600">
                            {' '}
                            - {player.position} ({player.nflTeam})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            {hydratedCurrentAuction && hydratedCurrentAuction.player && (
              <div className="bg-white rounded-lg shadow-lg p-6 relative">
                <button
                  onClick={() =>
                    auctionStore.deleteAuction(hydratedCurrentAuction.id)
                  }
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="flex flex-col">
                  <Link to={`/player/${hydratedCurrentAuction.player.id}`}>
                    <div className="flex items-center mb-4">
                      <img
                        src={getPlayerImageUrl(
                          hydratedCurrentAuction.player!.cbssportsId,
                        )}
                        alt={hydratedCurrentAuction.player!.name}
                        className="w-20 h-20 rounded-full border-2 border-blue-500 shadow-lg mr-4"
                      />
                      <div>
                        <p className="text-3xl font-bold">
                          {hydratedCurrentAuction.player?.name}
                        </p>
                        <p className="text-xl text-gray-600">
                          {hydratedCurrentAuction.player?.position} -{' '}
                          {hydratedCurrentAuction.player?.nflTeam}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Projected Points</p>
                      <p className="text-lg font-semibold">
                        {hydratedCurrentAuction.player?.projectedFantasyPoints}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Projected ppg</p>
                      <p className="text-lg font-semibold">
                        {(
                          hydratedCurrentAuction.player
                            ?.projectedFantasyPoints / 17
                        ).toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Year FPPG</p>
                      <p className="text-lg font-semibold">
                        {hydratedCurrentAuction.player?.lastYrFppg}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bye Week</p>
                      <p className="text-lg font-semibold">
                        {hydratedCurrentAuction.player?.bye}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="text-lg font-semibold">
                        {hydratedCurrentAuction.player?.age}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="text-lg font-semibold">
                        {hydratedCurrentAuction.player?.experience} years
                      </p>
                    </div>
                    {hydratedCurrentAuction.player?.projRanking && (
                      <div>
                        <p className="text-sm text-gray-600">
                          Projected Ranking
                        </p>
                        <p className="text-lg font-semibold">
                          {hydratedCurrentAuction.player.projRanking}
                        </p>
                      </div>
                    )}
                    {hydratedCurrentAuction.player?.projTier && (
                      <div>
                        <p className="text-sm text-gray-600">Projected Tier</p>
                        <p className="text-lg font-semibold">
                          {hydratedCurrentAuction.player.projTier}
                        </p>
                      </div>
                    )}
                    {hydratedCurrentAuction.player?.minSalary &&
                      hydratedCurrentAuction.player?.maxSalary && (
                        <div>
                          <p className="text-sm text-gray-600">
                            Projected Salary Range
                          </p>
                          <p className="text-lg font-semibold">
                            ${hydratedCurrentAuction.player.minSalary} - $
                            {hydratedCurrentAuction.player.maxSalary}
                          </p>
                        </div>
                      )}
                  </div>
                  {hydratedCurrentAuction.player.fullOutlook && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-2">
                        Player Outlook
                      </h4>
                      <p className="text-gray-700">
                        {hydratedCurrentAuction.player.fullOutlook}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-1/4 py-4 bg-gray-100">
          {hydratedCurrentAuction?.player && (
            <>
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h3 className="text-xl font-semibold mb-4">Auction Winner</h3>
                <div className="flex items-center space-x-4">
                  <form onSubmit={handleSubmitAuctionResult}>
                    <input
                      type="number"
                      placeholder="Bid"
                      className="w-24 p-2 border rounded"
                      onChange={(e) =>
                        setBidAmount(Number(e.currentTarget.value))
                      }
                    />
                    {winningBidderInfo ? (
                      <input
                        type="text"
                        placeholder="Team"
                        value={winningBidder}
                        onKeyDown={eraseWinningBidder}
                        className="flex-grow p-2 border rounded"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="Team"
                        className="flex-grow p-2 border rounded"
                        value={winningBidder}
                        onChange={handleWinningBidderChange}
                      />
                    )}
                  </form>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  My {hydratedCurrentAuction.player.position}s
                </h3>
                {myRosterPlayers.length > 0 ? (
                  <ul className="space-y-2">
                    {myRosterPlayers.map((player) => (
                      <Link
                        to={`/player/${player.playerId}`}
                        key={player.playerId}
                      >
                        <li
                          className={`p-2 rounded ${
                            player.hasSameByeWeek ? 'bg-red-100' : 'bg-gray-100'
                          } hover:bg-blue-100 transition-colors duration-200`}
                        >
                          <span className="font-semibold">{player.name}</span>
                          <span className="ml-2 text-sm text-gray-600">
                            Bye: {player.bye}
                          </span>
                        </li>
                      </Link>
                    ))}
                  </ul>
                ) : (
                  <p>
                    No {hydratedCurrentAuction.player.position}s on your roster.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </GodModeGate>
  )
})

export default CommandCenter
