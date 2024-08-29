// src/stores/TeamStore.ts
import { makeAutoObservable, runInAction } from 'mobx'
import { RootStore } from './RootStore'
import { api, ApiTeam } from '../services/api'

export class TeamStore {
  teams: ApiTeam[] = []
  isLoading = false
  error: string | null = null
  rootStore: RootStore
  hasLoaded = false

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this, {
      rootStore: false,
      hasLoaded: false,
    })
  }

  async fetchTeams() {
    if (this.hasLoaded) return // Prevent refetching if already loaded

    this.isLoading = true
    this.error = null
    try {
      const teams = await (await api.getTeams()).map((t) => ({
        ...t,
        usersTeam: t.id === parseInt(localStorage.getItem('my_team_id')!),
      }))
      runInAction(() => {
        this.teams = teams
        this.isLoading = false
        this.hasLoaded = true
      })
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : 'An unknown error occurred'
        this.isLoading = false
      })
    }
  }

  getTeamById(id: number) {
    return this.teams.find((team) => team.id === id)
  }
  getMyTeam() {
    return this.getTeamById(parseInt(localStorage.getItem('my_team_id')!))
  }
  getTeams() {
    return this.teams
  }

  async fetchTeamById(teamId: number) {
    try {
      const updatedTeam = await api.getTeamById(teamId)
      runInAction(() => {
        const index = this.teams.findIndex((team) => team.id === teamId)
        if (index !== -1) {
          this.teams[index] = {
            ...updatedTeam,
            usersTeam:
              updatedTeam.id === parseInt(localStorage.getItem('my_team_id')!),
          }
        }
      })
    } catch (error) {
      console.error(`Failed to fetch team with id ${teamId}:`, error)
    }
  }
}
