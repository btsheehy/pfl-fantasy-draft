// src/stores/AuctionStore.ts
import { makeAutoObservable } from 'mobx'
import { RootStore } from './RootStore'
import { AuctionResult, api, ApiPlayer, ApiTeam } from '../services/api'

export interface AuctionPlayer {
  id: number
  name: string
  position: string
  nflTeam: string
  projectedPoints: number
}

interface NewAuctionEvent {
  playerId: number
  nominatingTeamId: number
  initialBid: number
}

export class AuctionStore {
  currentAuction: {
    player: ApiPlayer | null
    nominatingTeam: ApiTeam | null
    initialBid: number
  } | null = null
  auctionResults: AuctionResult[] = []
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  handleNewAuction(
    event: NewAuctionEvent,
    players: ApiPlayer[],
    teams: ApiTeam[],
  ) {
    this.currentAuction = {
      player: players.find((player) => player.id === event.playerId) || null,
      nominatingTeam:
        teams.find((team) => team.id === event.nominatingTeamId) || null,
      initialBid: event.initialBid,
    }
  }

  async fetchAuctionResults() {
    try {
      const results = await api.getAuctionResults()
      this.auctionResults = results
    } catch (error) {
      console.error('Failed to fetch auction results:', error)
    }
  }
}
