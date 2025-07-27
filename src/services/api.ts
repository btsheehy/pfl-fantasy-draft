// src/services/api.ts
export const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://pfl-fantasy-draft-worker.cloudflare-1ab.workers.dev/api'
    : 'http://localhost:8787/api'

const fetchWithGodMode = async (url: string, options: RequestInit = {}) => {
  const godMode = localStorage.getItem('god_mode') === 'true'

  const headers = new Headers(options.headers)
  headers.set('god-mode', godMode ? 'true' : 'false')

  const updatedOptions: RequestInit = {
    ...options,
    headers,
  }

  return await fetch(url, updatedOptions)
}

export interface ApiPlayer {
  id: number
  cbssportsId: number
  name: string
  projectedFantasyPoints: number
  strengthOfSchedule: number
  lastYrFppg: number
  position: string
  experience: number
  bye: number
  nflTeam: string
  projRanking?: number
  projTier?: number
}

export interface ApiTeamPlayer {
  cbssportsId: number
  playerId: number
  name: string
  position: string
  contract: string
  salary: number
  starter: boolean
  injuredReserve: boolean
  practiceSquad: boolean
  projectedPpg: number
  status: 'active' | 'IR' | 'practice'
  nflTeam: string
  bye: number
}

export interface ApiTeam {
  id: number
  usersTeam: boolean
  name: string
  totalCap: number
  owner: string
  availableCap: number
  capToSpendOnOnePlayer: number
  players: ApiTeamPlayer[]
}

export interface ApiContract {
  id: number
  teamId: number
  playerId: number
  cbssportsId: number
  salary: number
  contract: string
  starter: boolean
  injuredReserve: boolean
  practiceSquad: boolean
}

export interface ApiPlayerMetadata {
  id: number
  cbssportsId: number
  name: string
  projectedFantasyPoints: number
  strengthOfSchedule: number
  lastYrFppg: number
  position: string
  nflTeam: string
  fullOutlook: string
  contract: string
  salary: number
  teamName: string
  age: number
  height: string
  weight: number
  experience: number
  bye: number
  projRanking?: number
  projTier?: number
  minSalary?: number
  maxSalary?: number
}

export interface PlayerNote {
  playerId: number
  teamId: number
  starred: boolean
  value: number
  notes: string
}

export interface AuctionResult {
  id: number
  playerId: number
  winningTeamId: number
  salary: number
}

export const api = {
  async getPlayers(): Promise<ApiPlayer[]> {
    const response = await fetchWithGodMode(`${API_BASE_URL}/players`)
    if (!response.ok) {
      throw new Error('Failed to fetch players')
    }
    return response.json()
  },

  async updateContract(
    teamId: number,
    cbssportsId: number,
    update: {
      salary: number
      starter: boolean
      injured_reserve: boolean
      practice_squad: boolean
    },
  ): Promise<ApiContract> {
    const response = await fetchWithGodMode(
      `${API_BASE_URL}/contracts/${teamId}/${cbssportsId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      },
    )
    if (!response.ok) {
      throw new Error('Failed to update contract')
    }
    return response.json()
  },

  async getTeams(): Promise<ApiTeam[]> {
    const response = await fetchWithGodMode(`${API_BASE_URL}/teams`)
    if (!response.ok) {
      throw new Error('Failed to fetch teams')
    }
    return response.json()
  },

  async getPlayerMetadata(playerId: number): Promise<ApiPlayerMetadata> {
    const response = await fetchWithGodMode(
      `${API_BASE_URL}/players/${playerId}`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch player metadata')
    }
    return response.json()
  },
  async getUserPlayerNotes(teamId: number): Promise<PlayerNote[]> {
    const response = await fetchWithGodMode(
      `${API_BASE_URL}/user-player-notes/${teamId}`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch user player notes')
    }
    return response.json()
  },
  async updateUserPlayerNote(
    teamId: number,
    playerId: number,
    update: Partial<PlayerNote>,
  ): Promise<PlayerNote> {
    const response = await fetchWithGodMode(
      `${API_BASE_URL}/user-player-notes/${teamId}/${playerId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      },
    )
    if (!response.ok) {
      throw new Error('Failed to update user player note')
    }
    return response.json()
  },
  async getUserPlayerNotesForPlayer(
    teamId: number,
    playerId: number,
  ): Promise<PlayerNote> {
    const response = await fetchWithGodMode(
      `${API_BASE_URL}/user-player-notes/${teamId}/${playerId}`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch user player notes')
    }
    return response.json()
  },
  getTeamById: async (teamId: number): Promise<ApiTeam> => {
    const response = await fetchWithGodMode(`${API_BASE_URL}/teams/${teamId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch team')
    }
    return response.json()
  },
  async getAuctionResults(): Promise<AuctionResult[]> {
    const response = await fetchWithGodMode(`${API_BASE_URL}/auctions`)
    if (!response.ok) {
      throw new Error('Failed to fetch auction results')
    }
    return response.json()
  },
  async setNewAuction(playerId: number): Promise<AuctionResult> {
    const response = await fetchWithGodMode(`${API_BASE_URL}/auctions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ player_id: playerId }),
    })
    if (!response.ok) {
      throw new Error('Failed to set new auction')
    }
    return response.json()
  },
  async deleteAuction(auctionId: number): Promise<void> {
    const response = await fetchWithGodMode(
      `${API_BASE_URL}/auctions/${auctionId}`,
      {
        method: 'DELETE',
      },
    )
    if (!response.ok) {
      throw new Error('Failed to delete auction')
    }
    return response.json()
  },
  async updateAuction(
    auctionId: number,
    update: {
      winning_team_id: number
      salary: number
    },
  ): Promise<{ success: boolean }> {
    const response = await fetchWithGodMode(
      `${API_BASE_URL}/auctions/${auctionId}`,
      {
        method: 'PUT',
        body: JSON.stringify(update),
      },
    )
    if (!response.ok) {
      throw new Error('Failed to update auction')
    }
    return response.json()
  },
  async triggerRefresh(type: string, id?: number): Promise<void> {
    const response = await fetchWithGodMode(`${API_BASE_URL}/trigger-refresh`, {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    })
    if (!response.ok) {
      throw new Error('Failed to trigger refresh')
    }
  },
}
