import { makeAutoObservable, runInAction } from 'mobx'
import { api, ApiPlayerMetadata } from '../services/api'
import { RootStore } from './RootStore'

export class PlayerMetadataStore {
  metadataCache: Map<number, ApiPlayerMetadata> = new Map()
  isLoading: boolean = false
  error: string | null = null
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this)
  }

  async fetchPlayerMetadata(playerId: number) {
    if (this.metadataCache.has(playerId)) {
      return this.metadataCache.get(playerId)
    }

    this.isLoading = true
    this.error = null

    try {
      const metadata = await api.getPlayerMetadata(playerId)
      runInAction(() => {
        this.metadataCache.set(playerId, metadata)
        this.isLoading = false
      })
      return metadata
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : String(error)
        this.isLoading = false
      })
    }
  }

  getPlayerMetadata(playerId: number): ApiPlayerMetadata | undefined {
    return this.metadataCache.get(playerId)
  }

  clearCache() {
    this.metadataCache.clear()
  }
}
