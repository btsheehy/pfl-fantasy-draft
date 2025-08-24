import React, { useState, useEffect, useMemo, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../hooks/useStore'
import { GodModeGate } from './SecurityComponents'
import { ApiPlayer, IdealDraft } from '../services/api'
import { getPlayerImageUrl } from '../utils'
import { Link } from 'react-router-dom'
import { debounce } from 'lodash'

interface DraftOptionsListProps {
  drafts: IdealDraft[]
  hydratedCurrentAuction?: any
}

const DraftOptionsList: React.FC<DraftOptionsListProps> = ({ drafts, hydratedCurrentAuction }) => {
  const currentPlayerTier = `${hydratedCurrentAuction?.player?.position}|${hydratedCurrentAuction?.player?.projTier}`
  
  // Helper function to format tiers with quantities
  const formatTiersWithQuantities = (positions: any[]) => {
    // Count occurrences of each tier
    const tierCounts: { [key: string]: number } = {};
    positions.forEach(pos => {
      if (!tierCounts[pos.tier]) {
        tierCounts[pos.tier] = 0;
      }
      tierCounts[pos.tier]++;
    });
    
    // Format tiers with quantities
    return Object.entries(tierCounts).map(([tier, count]) => {
      return `${count}${tier}`;
    }).join(',');
  };

  return (
    <div>
      {drafts.map((draft, index) => (
        <div key={index} className={`py-3 border-b border-gray-200 last:border-b-0 ${draft.positions.map(p => p.tier).includes(currentPlayerTier) ? 'bg-green-100' : ''}`}>
          <div className="flex justify-between items-center mb-2">
            <Link to={`/draft-scenario?tier=${formatTiersWithQuantities(draft.positions)}`}><div className="font-medium">Option {index + 1}</div></Link>
            <div className="text-sm">
              <span className="text-blue-600 font-semibold">{draft.points.toFixed(1)}</span> pts |
              <span className="text-green-600 font-semibold"> ${draft.cost}</span> cost |
              <span className="text-orange-600 font-semibold"> ${draft.totalCost}</span> total cost
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1">
            {draft.positions.map((position, posIndex) => {
              const isCurrentPlayerTier = currentPlayerTier === position.tier;

              return (
                <Link key={posIndex} to={`/players?available=true&position=${position.tier.split('|')[0]}&tier=${position.tier.split('|')[1].split('.')[0]}`}>
                  <div
                    className={`bg-gray-100 p-1 rounded text-sm ${
                      isCurrentPlayerTier ? 'border-2 border-green-500' : ''
                    }`}
                  >
                    <div title={`$${position.cost} | ${position.points.toFixed(1)} ppg`} className="font-medium text-center">{position.tier}</div>
                </div>
              </Link>
            )})}
          </div>
        </div>
      ))}
    </div>
  )
}

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
  const [fullOutlookExpanded, setFullOutlookExpanded] = useState(false)
  const rosteredPlayerIds = teamStore.getLeagueRosteredPlayerIds()

  const currentAuction = auctionStore.getCurrentAuction()

  useEffect(() => {
    auctionStore.fetchAuctionResults()
  }, [auctionStore])

  useEffect(() => {
    if (currentAuction?.playerId && userStore.godMode) {
      userStore.fetchIdealDraft()
      
      const player = playerMetadataStore.getPlayerMetadata(currentAuction.playerId)
      if (player) {
        const tierString = `${player.position}|${player.projTier}`
        userStore.fetchRemainingDraftOptions(tierString)
      }
    }
  }, [currentAuction?.playerId, playerMetadataStore, userStore, userStore.godMode])

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
    
  useEffect(() => {
    if (hydratedCurrentAuction?.player?.cbssportsId) {
      playerMetadataStore.fetchPlayerPffData(hydratedCurrentAuction.player.cbssportsId)
    }
  }, [hydratedCurrentAuction?.player?.cbssportsId])

  const pffData = playerMetadataStore.getPlayerPffData(hydratedCurrentAuction?.player?.cbssportsId || 0)
  console.log(pffData)

  useEffect(() => {
    if (userStore.idealDraftMode === 'starters') {
      userStore.fetchIdealDraft('starters')
    } else if (userStore.idealDraftMode === 'backups') {
      userStore.fetchIdealDraft('backups')
    }
  }, [userStore.idealDraftMode])

  useEffect(() => {
    const currentTier = hydratedCurrentAuction?.player 
      ? `${hydratedCurrentAuction.player.position}|${hydratedCurrentAuction.player.projTier}`
      : ''
    if (currentTier) {
      if (userStore.remainingDraftMode === 'starters') {
        userStore.fetchRemainingDraftOptions(currentTier, 'starters')
      } else if (userStore.remainingDraftMode === 'backups') {
        userStore.fetchRemainingDraftOptions(currentTier, 'backups')
      }
    }
  }, [hydratedCurrentAuction?.player, userStore.remainingDraftMode])

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

  const debouncedFetchIfDrafting = useRef(
    debounce((position: string, tier: number, salary: number, mode: 'starters' | 'backups') => {
      userStore.fetchIfDraftingOptions(position, tier, salary, mode);
    }, 150)
  ).current;

  useEffect(() => {
    if (hydratedCurrentAuction?.player && userStore.godMode) {
      const position = hydratedCurrentAuction.player.position;
      const tier = hydratedCurrentAuction.player.projTier!;
      const salary = bidAmount;
      
      debouncedFetchIfDrafting(position, tier, salary, userStore.ifDraftingMode);
    }
    
    // Clean up the debounced function on unmount
    return () => {
      debouncedFetchIfDrafting.cancel();
    };
  }, [hydratedCurrentAuction?.player, bidAmount, userStore.godMode, userStore.ifDraftingMode, debouncedFetchIfDrafting]);

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
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-xl font-semibold mb-4">Players in Tier</h3>
        <ul className="space-y-2">
          {playersInTier.map((player) => {
            return (
              <Link to={`/player/${player.id}`} key={player.id}>
                <li
                  className={`p-2 rounded ${
                    player.isAvailable ? 'bg-gray-100' : 'bg-red-100'
                  }`}
                >
                  <span className="font-semibold">{player.name}</span>
                  <span className="ml-2 text-sm text-gray-600">
                    {player.projectedFantasyPoints.toFixed(1)} pts
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    (SOS: {playerMetadataStore.getStrengthOfScheduleRanking(player.position, player.nflTeam)})
                  </span>
                </li>
              </Link>
            )
          })}
        </ul>
      </div>
    )
  }

  const renderIdealDraft = () => {
    const activeDrafts = userStore.idealDraftMode === 'starters'
      ? userStore.idealDraft.starters
      : userStore.idealDraft.backups

    return (
      <div className="bg-white rounded-lg shadow-md p-4 relative">
        <h3 className="text-xl font-semibold mb-4">Ideal Draft</h3>

        {/* Toggle Switch */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <button
            onClick={() => userStore.fetchIdealDraft(userStore.idealDraftMode)}
            className="text-gray-500 hover:text-blue-500 transition-colors duration-200 mr-3"
            title="Refresh ideal draft"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <div className="flex items-center">
            <button
              className={`px-3 py-1 text-sm rounded-l ${
                userStore.idealDraftMode === 'starters'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => userStore.setIdealDraftMode('starters')}
            >
              Starters
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-r ${
                userStore.idealDraftMode === 'backups'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => userStore.setIdealDraftMode('backups')}
            >
              Backups
            </button>
          </div>
        </div>

        {userStore.idealDraftLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : activeDrafts.length > 0 ? (
          <DraftOptionsList drafts={activeDrafts} hydratedCurrentAuction={hydratedCurrentAuction} />
        ) : (
          <p className="text-gray-500">No ideal draft data available.</p>
        )}
      </div>
    )
  }

  const renderRemainingDraftOptions = () => {
    const activeDrafts = userStore.remainingDraftMode === 'starters'
      ? userStore.remainingDraftOptions.starters
      : userStore.remainingDraftOptions.backups
      
    const currentTier = hydratedCurrentAuction?.player 
      ? `${hydratedCurrentAuction.player.position}|${hydratedCurrentAuction.player.projTier}`
      : ''

    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 relative">
        <h3 className="text-xl font-semibold mb-4">If You Pass...</h3>

        {/* Toggle Switch */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <button
            onClick={() => {
              if (currentTier) {
                userStore.fetchRemainingDraftOptions(
                  currentTier, 
                  userStore.remainingDraftMode
                )
              }
            }}
            className="text-gray-500 hover:text-blue-500 transition-colors duration-200 mr-3"
            title="Refresh remaining options"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <div className="flex items-center">
            <button
              className={`px-3 py-1 text-sm rounded-l ${
                userStore.remainingDraftMode === 'starters'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => {
                userStore.setRemainingDraftMode('starters')
                if (currentTier) {
                  userStore.fetchRemainingDraftOptions(currentTier, 'starters')
                }
              }}
            >
              Starters
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-r ${
                userStore.remainingDraftMode === 'backups'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => {
                userStore.setRemainingDraftMode('backups')
                if (currentTier) {
                  userStore.fetchRemainingDraftOptions(currentTier, 'backups')
                }
              }}
            >
              Backups
            </button>
          </div>
        </div>

        {userStore.remainingOptionsLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : activeDrafts.length > 0 ? (
          <DraftOptionsList drafts={activeDrafts} hydratedCurrentAuction={hydratedCurrentAuction}/>
        ) : (
          <p className="text-gray-500">No remaining draft options available.</p>
        )}
      </div>
    )
  }

  const renderIfDraftingOptions = () => {
    const activeDrafts = userStore.ifDraftingMode === 'starters'
      ? userStore.ifDraftingOptions.starters
      : userStore.ifDraftingOptions.backups
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 relative">
        <h3 className="text-xl font-semibold mb-4">If You Draft...</h3>

        {/* Toggle Switch */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <button
            onClick={() => {
              if (hydratedCurrentAuction?.player && bidAmount) {
                const position = hydratedCurrentAuction.player.position;
                const tier = hydratedCurrentAuction.player.projTier!;
                const salary = bidAmount;
                
                userStore.fetchIfDraftingOptions(position, tier, salary, userStore.ifDraftingMode);
              }
            }}
            className="text-gray-500 hover:text-blue-500 transition-colors duration-200 mr-3"
            title="Refresh if drafting options"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <div className="flex items-center">
            <button
              className={`px-3 py-1 text-sm rounded-l ${
                userStore.ifDraftingMode === 'starters'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => {
                userStore.setIfDraftingMode('starters');
                if (hydratedCurrentAuction?.player && bidAmount) {
                  const position = hydratedCurrentAuction.player.position;
                  const tier = hydratedCurrentAuction.player.projTier!;
                  const salary = bidAmount;
                  
                  userStore.fetchIfDraftingOptions(position, tier, salary, 'starters');
                }
              }}
            >
              Starters
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-r ${
                userStore.ifDraftingMode === 'backups'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => {
                userStore.setIfDraftingMode('backups');
                if (hydratedCurrentAuction?.player && bidAmount) {
                  const position = hydratedCurrentAuction.player.position;
                  const tier = hydratedCurrentAuction.player.projTier!;
                  const salary = bidAmount;
                  
                  userStore.fetchIfDraftingOptions(position, tier, salary, 'backups');
                }
              }}
            >
              Backups
            </button>
          </div>
        </div>

        {userStore.ifDraftingOptionsLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : activeDrafts.length > 0 ? (
          <DraftOptionsList drafts={activeDrafts} hydratedCurrentAuction={hydratedCurrentAuction} />
        ) : (
          <p className="text-gray-500">No draft options available if you draft this player.</p>
        )}
      </div>
    )
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
            <div>
              {renderPlayerTiers()}
              {userStore.godMode && renderIdealDraft()}
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
              <div className={`bg-white rounded-lg shadow-lg p-6 relative ${
                hydratedCurrentAuction?.player && userStore.isPlayerInIdealDraft(
                  `${hydratedCurrentAuction.player.position}|${hydratedCurrentAuction.player.projTier}`,
                ) ? 'border-2 border-green-500' : ''
              }`}>
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
                    {hydratedCurrentAuction.player?.cbssportsId && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">SoS Regular Season</p>
                          <p className="text-lg font-semibold">
                            {playerMetadataStore.getPlayerPffData(hydratedCurrentAuction.player.cbssportsId)?.strengthOfSchedule?.regularSeason?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">SoS Playoffs</p>
                          <p className="text-lg font-semibold">
                            {playerMetadataStore.getPlayerPffData(hydratedCurrentAuction.player.cbssportsId)?.strengthOfSchedule?.playoffs?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">SoS Overall</p>
                          <p className={`text-lg font-semibold ${
                            hydratedCurrentAuction.player.position && hydratedCurrentAuction.player.nflTeam && 
                            playerMetadataStore.getStrengthOfScheduleRanking(
                              hydratedCurrentAuction.player.position as 'QB' | 'RB' | 'WR' | 'TE' | 'DST', 
                              hydratedCurrentAuction.player.nflTeam
                            ) 
                              ? playerMetadataStore.getStrengthOfScheduleRanking(
                                  hydratedCurrentAuction.player.position as 'QB' | 'RB' | 'WR' | 'TE' | 'DST', 
                                  hydratedCurrentAuction.player.nflTeam
                                ) || 0 <= 12 
                                  ? 'text-green-500' 
                                  : playerMetadataStore.getStrengthOfScheduleRanking(
                                      hydratedCurrentAuction.player.position as 'QB' | 'RB' | 'WR' | 'TE' | 'DST', 
                                      hydratedCurrentAuction.player.nflTeam
                                    ) || 0 >= 20 
                                    ? 'text-red-500' 
                                    : ''
                              : ''
                          }`}>
                            {playerMetadataStore.getPlayerPffData(hydratedCurrentAuction.player.cbssportsId)?.strengthOfSchedule?.all?.toFixed(2) || 'N/A'}
                            {hydratedCurrentAuction.player.position && hydratedCurrentAuction.player.nflTeam && 
                              ` (#${playerMetadataStore.getStrengthOfScheduleRanking(hydratedCurrentAuction.player.position as 'QB' | 'RB' | 'WR' | 'TE' | 'DST', hydratedCurrentAuction.player.nflTeam) || 'N/A'})`
                            }
                          </p>
                        </div>
                      </>
                    )}
                    {pffData && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Offense</p>
                          <p className="text-lg font-semibold">
                            {(pffData.passing || pffData.rushing || pffData.receiving)?.gradesOffense.toFixed(1)}
                          </p>
                        </div> 
                      {pffData.passing && (
                        <div>
                          <p className="text-sm text-gray-600">Passing</p>
                          <p className="text-lg font-semibold">
                            {pffData.passing?.gradesPass.toFixed(1)}
                          </p>
                        </div>
                      )}
                      {pffData.rushing && (
                        <div>
                          <p className="text-sm text-gray-600">Rushing</p>
                          <p className="text-lg font-semibold">
                            {pffData.rushing?.gradesRun.toFixed(1)}
                          </p>
                        </div>
                      )}
                      {pffData.receiving && (
                        <div>
                          <p className="text-sm text-gray-600">Receiving</p>
                          <p className="text-lg font-semibold">
                            {pffData.receiving?.gradesPassRoute.toFixed(1)}
                          </p>
                        </div>
                      )}
                      </>
                    )}
                  </div>
                  {hydratedCurrentAuction.player.fullOutlook && (
                    <div className="mt-6" onClick={() => setFullOutlookExpanded(!fullOutlookExpanded)}>
                      <h4 className="text-lg font-semibold mb-2 cursor-pointer">
                        Player Outlook
                      </h4>
                      <p className={`text-gray-700 relative ${!fullOutlookExpanded ? 'h-24 overflow-y-hidden' : ''}`}>
                        {!fullOutlookExpanded && (
                          <span className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                        )}
                        {hydratedCurrentAuction.player.fullOutlook}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 py-4">
              {userStore.godMode && hydratedCurrentAuction?.player && bidAmount && renderIfDraftingOptions() || null}
            </div>
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
              <div className="grid grid-cols-1 gap-6">
                  {userStore.godMode && hydratedCurrentAuction?.player && renderRemainingDraftOptions()}
              </div>
            </>
          )}
        </div>
      </div>
    </GodModeGate>
  )
})

export default CommandCenter
