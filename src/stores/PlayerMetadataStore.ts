import { makeAutoObservable, runInAction } from 'mobx'
import { api, ApiPlayerMetadata, PffPassingStats, PffRushingStats, PffReceivingStats, PffStrengthOfSchedule, StrengthOfScheduleRankings } from '../services/api'
import { RootStore } from './RootStore'

export interface PlayerPffData {
  cbssportsId: number
  passing?: PffPassingStats
  rushing?: PffRushingStats 
  receiving?: PffReceivingStats 
  strengthOfSchedule: PffStrengthOfSchedule 
}

export class PlayerMetadataStore {
  metadataCache: Map<number, ApiPlayerMetadata> = new Map()
  pffDataCache: Map<number, PlayerPffData> = new Map()
  strengthOfScheduleRankings: StrengthOfScheduleRankings = {
    QB: {},
    RB: {},
    WR: {},
    TE: {},
    DST: {},
  }
  strengthOfScheduleRankingsHasLoaded: boolean = false
  isLoading: boolean = false
  error: string | null = null
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this, {
      rootStore: false
    })
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
      
      // Fetch PFF data if we have a cbsSportsId
      if (metadata.cbssportsId) {
        this.fetchPlayerPffData(metadata.cbssportsId)
      }
      
      return metadata
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : String(error)
        this.isLoading = false
      })
    }
  }

  async fetchPlayerPffData(cbssportsId: number) {
    try {
      // Return cached data if available
      if (this.pffDataCache.has(cbssportsId)) {
        return this.pffDataCache.get(cbssportsId)
      }
      
      const pffData = await api.getPlayerPffData(cbssportsId)
      
      runInAction(() => {
        this.pffDataCache.set(cbssportsId, {
          ...pffData,
          cbssportsId,
        })
      })
      
      return pffData
    } catch (error) {
      console.error('Failed to fetch PFF data:', error)
    }
  }
  
  async fetchStrengthOfScheduleRankings() {
    try {
      const rankings = await api.getStrengthOfScheduleRankings()
      
      runInAction(() => {
        this.strengthOfScheduleRankings = rankings
        this.strengthOfScheduleRankingsHasLoaded = true
      })
      
      return rankings
    } catch (error) {
      console.error('Failed to fetch strength of schedule rankings:', error)
    }
  }

  getPlayerMetadata(playerId: number): ApiPlayerMetadata | undefined {
    return this.metadataCache.get(playerId)
  }
  
  getPlayerPffData(cbssportsId: number): PlayerPffData | undefined {
    return this.pffDataCache.get(cbssportsId)
  }

  getStrengthOfScheduleRanking(position: 'QB' | 'RB' | 'WR' | 'TE' | 'DST', nflTeam: string): number | null {
    return this.strengthOfScheduleRankings[position]?.[nflTeam] ?? null
  }

  clearCache() {
    this.metadataCache.clear()
    this.pffDataCache.clear()
  }
}
