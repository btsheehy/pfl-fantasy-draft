import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../hooks/useStore';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = observer(({ children }) => {
  const { playerStore, teamStore, webSocketStore, auctionStore } = useStore();

  useEffect(() => {
    if (!playerStore.hasLoaded) {
      playerStore.fetchPlayers();
    }
    if (!teamStore.hasLoaded) {
      teamStore.fetchTeams();
    }

    webSocketStore.connect();
  }, [playerStore, teamStore, webSocketStore]);

  useEffect(() => {
    if (webSocketStore.socket) {
      webSocketStore.socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'newAuction') {
          auctionStore.handleNewAuction(data.auction, playerStore.players, teamStore.teams)
        }
        if (data.type === 'auctionResult') {
          auctionStore.fetchAuctionResults()
          teamStore.fetchTeamById(data.auction.winningTeamId)
        }
      }
    }
  }, [webSocketStore.socket, auctionStore, playerStore, teamStore])

  if (playerStore.isLoading || teamStore.isLoading) {
    return <div>Loading data...</div>;
  }

  if (playerStore.error) {
    return <div>Error loading players: {playerStore.error}</div>;
  }

  if (teamStore.error) {
    return <div>Error loading teams: {teamStore.error}</div>;
  }

  return <>{children}</>;
});

export default AppInitializer;