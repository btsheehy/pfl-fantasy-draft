// src/services/api.ts
export const API_BASE_URL = "http://localhost:8787/api";

export interface ApiPlayer {
	id: number;
	cbssportsId: number;
	name: string;
	projectedFantasyPoints: number;
	strengthOfSchedule: number;
	lastYrFppg: number;
	position: string;
	experience: number;
	bye: number;
	nflTeam: string;
}

export interface ApiTeam {
	id: number;
	usersTeam: boolean;
	name: string;
	totalCap: number;
	owner: string;
	availableCap: number;
	capToSpendOnOnePlayer: number;
	players: {
		cbssportsId: number;
		playerId: number;
		name: string;
		position: string;
		contract: string;
		salary: number;
		starter: boolean;
		injuredReserve: boolean;
		practiceSquad: boolean;
		projectedPpg: number;
		status: "active" | "IR" | "practice";
		nflTeam: string;
	}[];
}

export interface ApiContract {
	id: number;
	teamId: number;
	playerId: number;
	cbssportsId: number;
	salary: number;
	contract: string;
	starter: boolean;
	injuredReserve: boolean;
	practiceSquad: boolean;
}

export interface ApiPlayerMetadata {
  id: number;
  cbssportsId: number;
  name: string;
  projectedFantasyPoints: number;
  strengthOfSchedule: number;
  lastYrFppg: number;
  position: string;
	nflTeam: string;
	fullOutlook: string;
	contract: string;
	salary: number;
	teamName: string;
	age: number;
	height: string;
	weight: number;
	experience: number;
	bye: number;
}

export interface PlayerNote {
	playerId: number;
	teamId: number;
	starred: boolean;
	value: number;
	notes: string;
}

export interface AuctionResult {
	id: number;
	playerId: number;
	nominatingTeamId: number;
	winningTeamId: number;
	salary: number;
}

export const api = {
	async getPlayers(): Promise<ApiPlayer[]> {
		const response = await fetch(`${API_BASE_URL}/players`);
		if (!response.ok) {
			throw new Error("Failed to fetch players");
		}
		return response.json();
	},

	async getTeams(): Promise<ApiTeam[]> {
		const response = await fetch(`${API_BASE_URL}/teams`);
		if (!response.ok) {
			throw new Error("Failed to fetch teams");
		}
		return response.json();
	},

	async getPlayerMetadata(playerId: number): Promise<ApiPlayerMetadata> {
		const response = await fetch(`${API_BASE_URL}/players/${playerId}`);
		if (!response.ok) {
			throw new Error("Failed to fetch player metadata");
		}
		return response.json();
	},
	async getUserPlayerNotes(teamId: number): Promise<PlayerNote[]> {
		const response = await fetch(`${API_BASE_URL}/user-player-notes/${teamId}`);
		if (!response.ok) {
			throw new Error("Failed to fetch user player notes");
		}
		return response.json();
	},
	async updateUserPlayerNote(teamId: number, playerId: number, update: Partial<PlayerNote>): Promise<PlayerNote> {
		const response = await fetch(`${API_BASE_URL}/user-player-notes/${teamId}/${playerId}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(update),
		});
		if (!response.ok) {
			throw new Error("Failed to update user player note");
		}
		return response.json();
	},
	async getUserPlayerNotesForPlayer(teamId: number, playerId: number): Promise<PlayerNote> {
		const response = await fetch(`${API_BASE_URL}/user-player-notes/${teamId}/${playerId}`);
		if (!response.ok) {
			throw new Error("Failed to fetch user player notes");
		}
		return response.json();
	},
	getTeamById: async (teamId: number): Promise<ApiTeam> => {
		const response = await fetch(`${API_BASE_URL}/teams/${teamId}`);
		if (!response.ok) {
			throw new Error('Failed to fetch team');
		}
		return response.json();
	},
	async getAuctionResults(): Promise<AuctionResult[]> {
		const response = await fetch(`${API_BASE_URL}/auctions`);
		if (!response.ok) {
			throw new Error("Failed to fetch auction results");
		}
		return response.json();
	}
};