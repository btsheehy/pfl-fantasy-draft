// src/stores/RootStore.ts
import { PlayerStore } from "./PlayerStore"
import { AuctionStore } from "./AuctionStore"
import { TeamStore } from "./TeamStore"

export class RootStore {
	playerStore: PlayerStore
	auctionStore: AuctionStore
	teamStore: TeamStore

	constructor() {
		this.playerStore = new PlayerStore(this)
		this.auctionStore = new AuctionStore(this)
		this.teamStore = new TeamStore(this)
	}
}
