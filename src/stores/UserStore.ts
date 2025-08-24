import { makeAutoObservable, runInAction } from 'mobx'
import { RootStore } from './RootStore'
import { api } from '../services/api'
import { PlayerNote, IdealDraft } from '../services/api'

export class UserStore {
  rootStore: RootStore
  teamId: number | null = null
  playerNotes: Map<number, PlayerNote> = new Map()
  godMode: boolean = false
  idealDraft: { starters: IdealDraft[], backups: IdealDraft[] } = { starters: [], backups: [] }
  idealDraftMode: 'starters' | 'backups' = 'starters'
  idealDraftLoading: boolean = false
  remainingDraftOptions: { starters: IdealDraft[], backups: IdealDraft[] } = { starters: [], backups: [] }
  remainingDraftMode: 'starters' | 'backups' = 'starters'
  remainingOptionsLoading: boolean = false
  ifDraftingOptions: { starters: IdealDraft[], backups: IdealDraft[] } = { starters: [], backups: [] }
  ifDraftingMode: 'starters' | 'backups' = 'starters'
  ifDraftingOptionsLoading: boolean = false

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this, {
      rootStore: false,
    })
    this.initializeTeamId()
    this.fetchIdealDraft()
  }

  initializeTeamId() {
    const storedTeamId = localStorage.getItem('my_team_id')
    if (storedTeamId) {
      this.setTeamId(parseInt(storedTeamId, 10))
      if (localStorage.getItem('god_mode') === 'true') {
        this.godMode = true
      }
    }
  }

  setTeamId(id: number) {
    runInAction(() => {
      this.teamId = id
      localStorage.setItem('my_team_id', id.toString())
      this.fetchPlayerNotes()
    })
  }

  async fetchPlayerNotes() {
    if (!this.teamId) return
    try {
      const notes = await api.getUserPlayerNotes(this.teamId)
      runInAction(() => {
        this.playerNotes = new Map(notes.map((note) => [note.playerId, note]))
      })
    } catch (error) {
      console.error('Failed to fetch player notes:', error)
    }
  }

  setIdealDraftMode(mode: 'starters' | 'backups') {
    runInAction(() => {
      this.idealDraftMode = mode
      this.fetchIdealDraft(mode)
    })
  }

  setRemainingDraftMode(mode: 'starters' | 'backups') {
    runInAction(() => {
      this.remainingDraftMode = mode
      this.fetchRemainingDraftOptions('', mode)
    })
  }

  setIfDraftingMode(mode: 'starters' | 'backups') {
    runInAction(() => {
      this.ifDraftingMode = mode
    })
  }

  async fetchIdealDraft(mode?: 'starters' | 'backups') {
    if (!this.godMode || !this.teamId) return
    
    const fetchMode = mode || this.idealDraftMode
    
    runInAction(() => { this.idealDraftLoading = true })
    
    try {
      const idealDraft = await api.calculateIdealDraft(
        this.teamId, 
        fetchMode === 'starters'
      )
      
      runInAction(() => {
        if (idealDraft.starters) this.idealDraft.starters = idealDraft.starters
        if (idealDraft.backups) this.idealDraft.backups = idealDraft.backups
      })
    } catch (error) {
      console.error('Failed to fetch ideal draft:', error)
    } finally {
      runInAction(() => { this.idealDraftLoading = false })
    }
  }

  async fetchRemainingDraftOptions(skipTier: string, mode?: 'starters' | 'backups') {
    if (!this.godMode || !this.teamId) return
    
    const fetchMode = mode || this.remainingDraftMode
    
    runInAction(() => { this.remainingOptionsLoading = true })
    
    try {
      const remainingOptions = await api.calculateRemainingDraftOptions(
        this.teamId,
        skipTier,
        fetchMode === 'starters'
      )
      
      runInAction(() => {
        if (remainingOptions.starters) this.remainingDraftOptions.starters = remainingOptions.starters
        if (remainingOptions.backups) this.remainingDraftOptions.backups = remainingOptions.backups
      })
    } catch (error) {
      console.error('Failed to fetch remaining draft options:', error)
    } finally {
      runInAction(() => { this.remainingOptionsLoading = false })
    }
  }

  async fetchIfDraftingOptions(position: string, tier: number, salary: number, mode?: 'starters' | 'backups') {
    if (!this.godMode || !this.teamId) return
    
    const fetchMode = mode || this.ifDraftingMode
    
    runInAction(() => { this.ifDraftingOptionsLoading = true })
    
    try {
      const options = await api.calculateIfDraftingOptions(
        this.teamId,
        position,
        tier,
        salary,
        fetchMode === 'starters'
      )
      
      runInAction(() => {
        if (options.starters) this.ifDraftingOptions.starters = options.starters
        if (options.backups) this.ifDraftingOptions.backups = options.backups
      })
    } catch (error) {
      console.error('Failed to fetch draft options if drafting:', error)
    } finally {
      runInAction(() => { this.ifDraftingOptionsLoading = false })
    }
  }

  async fetchUserPlayerNotesForPlayer(playerId: number) {
    if (!this.teamId) return
    try {
      const note = await api.getUserPlayerNotesForPlayer(this.teamId, playerId)
      runInAction(() => {
        this.playerNotes.set(playerId, note)
      })
    } catch (err) {
      console.error(
        'Failed to fetch user player notes for player:',
        playerId,
        err,
      )
    }
  }

  async updatePlayerNote(playerId: number, update: Partial<PlayerNote>) {
    if (!this.teamId) return
    try {
      const updatedNote = await api.updateUserPlayerNote(
        this.teamId,
        playerId,
        update,
      )
      await this.fetchPlayerNotes()
    } catch (error) {
      console.error('Failed to update player note:', error)
    }
  }

  isPlayerInIdealDraft(projTier?: string): boolean {
    const tierToCheck = projTier ? `${projTier}` : undefined
    if (!tierToCheck) return false
    const draft = this.idealDraft[this.idealDraftMode]
    return draft.some(draft => 
      draft.positions.some(position => position.tier === tierToCheck)
    )
  }

  isPlayerInRemainingDraftOptions(projTier?: string): boolean {
    const tierToCheck = projTier ? `${projTier}` : undefined
    if (!tierToCheck) return false
    
    const drafts = this.remainingDraftOptions[this.remainingDraftMode]
    return drafts.some(draft => 
      draft.positions.some(position => position.tier === tierToCheck)
    )
  }

  isPlayerInIfDraftingOptions(projTier?: string): boolean {
    const tierToCheck = projTier ? `${projTier}` : undefined
    if (!tierToCheck) return false
    
    const drafts = this.ifDraftingOptions[this.ifDraftingMode]
    return drafts.some(draft => 
      draft.positions.some(position => position.tier === tierToCheck)
    )
  }

  starPlayer(playerId: number) {
    this.updatePlayerNote(playerId, { starred: true })
  }

  unstarPlayer(playerId: number) {
    this.updatePlayerNote(playerId, { starred: false })
  }

  isPlayerStarred(playerId: number): boolean {
    return this.playerNotes.get(playerId)?.starred || false
  }

  setPlayerValue(playerId: number, value: number) {
    this.updatePlayerNote(playerId, { value })
  }

  setPlayerNotes(playerId: number, notes: string) {
    this.updatePlayerNote(playerId, { notes })
  }

  getPlayerNote(playerId: number): PlayerNote | undefined {
    return this.playerNotes.get(playerId)
  }

  get starredPlayersList(): number[] {
    return Array.from(this.playerNotes.values())
      .filter((note) => note && note.starred)
      .map((note) => note.playerId)
  }
}
