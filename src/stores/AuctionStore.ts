// src/stores/AuctionStore.ts
import { makeAutoObservable, runInAction } from 'mobx'
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
  auctionResults: AuctionResult[] = []
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  getCurrentAuction() {
    if (
      this.auctionResults.length > 0 &&
      !this.auctionResults[0].winningTeamId
    ) {
      return this.auctionResults[0]
    }
    return null
  }

  getRecentAuctionResults() {
    return this.auctionResults.filter((result) => !!result.winningTeamId)
  }

  async setNewAuction(playerId: number) {
    const result = await api.setNewAuction(playerId)
    runInAction(() => {
      this.fetchAuctionResults()
    })
  }

  // handleNewAuction(
  //   event: NewAuctionEvent,
  //   players: ApiPlayer[],
  //   teams: ApiTeam[],
  // ) {
  //   this.currentAuction = {
  //     player: players.find((player) => player.id === event.playerId) || null,
  //     nominatingTeam:
  //       teams.find((team) => team.id === event.nominatingTeamId) || null,
  //     initialBid: event.initialBid,
  //   }
  // }

  async fetchAuctionResults() {
    try {
      const results = await api.getAuctionResults()
      runInAction(() => {
        this.auctionResults = results
      })
    } catch (error) {
      console.error('Failed to fetch auction results:', error)
    }
  }

  async deleteAuction(auctionId: number) {
    const result = await api.deleteAuction(auctionId)
    runInAction(() => {
      this.fetchAuctionResults()
    })
  }

  async updateAuction(
    auctionId: number,
    winningTeamId: number,
    salary: number,
  ) {
    const result = await api.updateAuction(auctionId, {
      winning_team_id: winningTeamId,
      salary,
    })
    runInAction(() => {
      this.fetchAuctionResults()
    })
  }
}
