// src/stores/TeamStore.ts
import { makeAutoObservable, runInAction } from "mobx"
import { RootStore } from "./RootStore"
import { api, ApiTeam } from "../services/api"

export class TeamStore {
	teams: ApiTeam[] = []
	isLoading = false
	error: string | null = null
	rootStore: RootStore

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore
		makeAutoObservable(this)
	}

	async fetchTeams() {
		this.isLoading = true
		this.error = null
		try {
			const teams = await api.getTeams()
			runInAction(() => {
				this.teams = teams
				this.isLoading = false
			})
		} catch (error) {
			runInAction(() => {
				this.error =
					error instanceof Error ? error.message : "An unknown error occurred"
				this.isLoading = false
			})
		}
	}

	getTeamById(id: number) {
		return this.teams.find((team) => team.id === id)
	}
	getMyTeam() {
		return this.getTeamById(parseInt(localStorage.getItem("my_team_id")!))
	}
}
