// src/stores/RootStore.ts
import { PlayerStore } from './PlayerStore'
import { TeamStore } from './TeamStore'
import { AuctionStore } from './AuctionStore'
import { PlayerMetadataStore } from './PlayerMetadataStore'
import { UserStore } from './UserStore'
import { WebSocketStore } from './WebSocketStore'

export class RootStore {
  playerStore: PlayerStore
  teamStore: TeamStore
  auctionStore: AuctionStore
  playerMetadataStore: PlayerMetadataStore
  webSocketStore: WebSocketStore
  userStore: UserStore

  constructor() {
    this.playerStore = new PlayerStore(this)
    this.teamStore = new TeamStore(this)
    this.auctionStore = new AuctionStore(this)
    this.playerMetadataStore = new PlayerMetadataStore(this)
    this.userStore = new UserStore(this)
    this.webSocketStore = new WebSocketStore(this)
  }
}
