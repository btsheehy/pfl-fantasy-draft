// src/services/api.ts
const API_BASE_URL = "http://localhost:8787/api"

export interface ApiPlayer {
	id: number
	cbssports_id: number
	name: string
	projected_fantasy_points: number
	strength_of_schedule: number
	last_yr_fppg: number
	position: string
}

export interface ApiTeam {
	id: number
	name: string
	total_cap: number
	owner: string
}

export const api = {
	async getPlayers(): Promise<ApiPlayer[]> {
		const response = await fetch(`${API_BASE_URL}/players`)
		if (!response.ok) {
			throw new Error("Failed to fetch players")
		}
		return response.json()
	},

	async getTeams(): Promise<ApiTeam[]> {
		const response = await fetch(`${API_BASE_URL}/teams`)
		if (!response.ok) {
			throw new Error("Failed to fetch teams")
		}
		return response.json()
	},
}
