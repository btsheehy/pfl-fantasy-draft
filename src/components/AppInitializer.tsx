import React, { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '../hooks/useStore'

interface AppInitializerProps {
  children: React.ReactNode
}

interface Refresh {
  type: 'team' | 'player' | 'auction' | 'playerMetadata' | 'all'
  id: string | number | null | undefined
}

const AppInitializer: React.FC<AppInitializerProps> = observer(
  ({ children }) => {
    const { playerStore, teamStore, webSocketStore, auctionStore, playerMetadataStore } = useStore()

    useEffect(() => {
      if (!playerStore.hasLoaded) {
        playerStore.fetchPlayers()
      }
      if (!teamStore.hasLoaded) {
        teamStore.fetchTeams()
      }
      
      // Fetch strength of schedule rankings if god_mode is enabled
      const godMode = localStorage.getItem('god_mode') === 'true'
      if (godMode && !playerMetadataStore.strengthOfScheduleRankingsHasLoaded) {
        playerMetadataStore.fetchStrengthOfScheduleRankings()
      }

      webSocketStore.connect()
    }, [playerStore, teamStore, webSocketStore, playerMetadataStore])

    useEffect(() => {
      if (webSocketStore.socket) {
        webSocketStore.socket.onmessage = (event) => {
          const eventData = JSON.parse(event.data)
          console.log('received websocket data')
          console.log(eventData)
          if (eventData.type === 'refresh') {
            const refresh = eventData.data as Refresh
            if (refresh.type === 'team') {
              if (refresh.id) {
                console.log('refreshing team', refresh.id)
                teamStore.fetchTeamById(refresh.id as number)
              } else {
                console.log('refreshing all teams')
                teamStore.fetchTeams()
              }
            }
            if (refresh.type === 'auction') {
              console.log('refreshing auction results')
              auctionStore.fetchAuctionResults()
            }
            if (refresh.type === 'all') {
              console.log('refreshing all')
              // playerStore.fetchPlayers()
              teamStore.fetchTeams()
              auctionStore.fetchAuctionResults()
            }
          }
          // if (data.type === 'newAuction') {
          //   auctionStore.handleNewAuction(
          //     data.auction,
          //     playerStore.players,
          //     teamStore.teams,
          //   )
          // }
          // if (data.type === 'auctionResult') {
          //   auctionStore.fetchAuctionResults()
          //   teamStore.fetchTeamById(data.auction.winningTeamId)
          // }
        }
      }
    }, [webSocketStore.socket, auctionStore, playerStore, teamStore, playerMetadataStore])

    if (playerStore.isLoading || teamStore.isLoading) {
      return <div>Loading data...</div>
    }

    if (playerStore.error) {
      return <div>Error loading players: {playerStore.error}</div>
    }

    if (teamStore.error) {
      return <div>Error loading teams: {teamStore.error}</div>
    }

    return <>{children}</>
  },
)

export default AppInitializer
