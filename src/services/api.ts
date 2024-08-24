// src/services/api.ts
const API_BASE_URL = "http://localhost:8787/api";

export interface ApiPlayer {
  id: number;
  cbssportsId: number;
  name: string;
  projectedFantasyPoints: number;
  strengthOfSchedule: number;
  lastYrFppg: number;
  position: string;
}

export interface ApiTeam {
  id: number;
  name: string;
  totalCap: number;
  owner: string;
}

export interface ApiContract {
  id: number;
  teamId: number;
  playerId: number;
  cbsSportsId: number;
  salary: number;
  contract: string;
  starter: boolean;
  injuredReserve: boolean;
  practiceSquad: boolean;
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
};
