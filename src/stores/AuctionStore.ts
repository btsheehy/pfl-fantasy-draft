// src/stores/AuctionStore.ts
import { makeAutoObservable } from "mobx"
import { RootStore } from "./RootStore"

export interface AuctionResult {
	playerId: number
	winningTeamId: number
	winningBid: number
}

export class AuctionStore {
	currentAuctionPlayerId: number | null = null
	auctionResults: AuctionResult[] = []
	rootStore: RootStore

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore
		makeAutoObservable(this)
		this.loadMockAuctionResults()
	}

	loadMockAuctionResults() {
		this.auctionResults = [
			{ playerId: 1, winningTeamId: 1, winningBid: 55 },
			{ playerId: 2, winningTeamId: 2, winningBid: 65 },
			{ playerId: 3, winningTeamId: 3, winningBid: 58 },
		]
	}

	setCurrentAuctionPlayer(playerId: number) {
		this.currentAuctionPlayerId = playerId
	}

	addAuctionResult(result: AuctionResult) {
		this.auctionResults.push(result)
		this.currentAuctionPlayerId = null
	}
}
