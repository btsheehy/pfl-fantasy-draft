import { makeAutoObservable, runInAction } from 'mobx'
import { RootStore } from './RootStore'
import { api } from '../services/api'
import { PlayerNote } from '../services/api'

export class UserStore {
  rootStore: RootStore
  teamId: number | null = null
  playerNotes: Map<number, PlayerNote> = new Map()
  godMode: boolean = false

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this, {
      rootStore: false,
    })
    this.initializeTeamId()
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

  async updatePlayerNote(playerId: number, update: Partial<PlayerNote>) {
    if (!this.teamId) return
    try {
      const updatedNote = await api.updateUserPlayerNote(
        this.teamId,
        playerId,
        update,
      )
      runInAction(() => {
        this.playerNotes.set(playerId, updatedNote)
      })
    } catch (error) {
      console.error('Failed to update player note:', error)
    }
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
      .filter((note) => note.starred)
      .map((note) => note.playerId)
  }
}
