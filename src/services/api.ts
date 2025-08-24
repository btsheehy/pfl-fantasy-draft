// src/services/api.ts
export const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://pfl-fantasy-draft-worker.cloudflare-1ab.workers.dev/api'
    : 'http://localhost:8787/api'

const IDEAL_DRAFT_API_URL = 'https://draft-bot.local:3000/calculate-best-draft'

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
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'DST'
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

export interface IdealDraft {
  cost: number 
  totalCost: number 
  points: number 
  positions: {
    tier: string
    cost: number
    points: number
  }[]
}

export interface StrengthOfScheduleRankings {
  QB:  { [key: string]: number };
  RB:  { [key: string]: number };
  WR:  { [key: string]: number };
  TE:  { [key: string]: number };
  DST: { [key: string]: number };
}

export interface PffPassingStats {
  gradesOffense:       number;
  twpRate:             number;
  bttRate:             number;
  spikes:              number;
  dropbacks:           number;
  thrownAways:         number;
  draftSeason:         number;
  teamName:            string;
  gradesPass:          number;
  hitAsThrew:          number;
  firstDowns:          number;
  jerseyNumber:        string;
  sackPercent:         number;
  bats:                number;
  sacks:               number;
  playerGameCount:     number;
  eligibleSeason:      number;
  completions:         number;
  yards:               number;
  accuracyPercent:     number;
  scrambles:           number;
  interceptions:       number;
  dropRate:            number;
  gradesRun:           number;
  qbRating:            number;
  completionPercent:   number;
  penalties:           number;
  attempts:            number;
  team:                string;
  declinedPenalties:   number;
  passingSnaps:        number;
  pressureToSackRate:  number;
  ypa:                 number;
  drops:               number;
  position:            string;
  gradesHandsFumble:   number;
  avgTimeToThrow:      number;
  bigTimeThrows:       number;
  player:              string;
  franchiseId:         number;
  avgDepthOfTarget:    number;
  turnoverWorthyPlays: number;
  aimedPasses:         number;
  playerId:            number;
  touchdowns:          number;
  defGenPressures:     number;
}

export interface PffRushingStats {
  targets:              number;
  gradesOffense:        number;
  yardsAfterContact:    number;
  explosive:            number;
  gradesPassRoute:      number;
  draftSeason:          number;
  eluRushMtf:           number;
  breakawayAttempts:    number;
  designedYards:        number;
  teamName:             string;
  yprr:                 number;
  breakawayPercent:     number;
  gradesPass:           number;
  fumbles:              number;
  firstDowns:           number;
  elusiveRating:        number;
  jerseyNumber:         string;
  breakawayYards:       number;
  playerGameCount:      number;
  eligibleSeason:       number;
  totalTouches:         number;
  scrambleYards:        number;
  ycoAttempt:           number;
  yards:                number;
  gradesRunBlock:       number;
  receptions:           number;
  zoneAttempts:         number;
  scrambles:            number;
  gradesRun:            number;
  penalties:            number;
  attempts:             number;
  eluYco:               number;
  eluRecvMtf:           number;
  team:                 string;
  declinedPenalties:    number;
  ypa:                  number;
  drops:                number;
  position:             string;
  gradesHandsFumble:    number;
  longest:              number;
  routes:               number;
  player:               string;
  franchiseId:          number;
  recYards:             number;
  gapAttempts:          number;
  runPlays:             number;
  avoidedTackles:       number;
  gradesOffensePenalty: number;
  playerId:             number;
  touchdowns:           number;
}

export interface PffReceivingStats {
  targets:                     number;
  gradesOffense:               number;
  yardsAfterCatchPerReception: number;
  gradesPassRoute:             number;
  draftSeason:                 number;
  teamName:                    string;
  yprr:                        number;
  wideSnaps:                   number;
  fumbles:                     number;
  firstDowns:                  number;
  jerseyNumber:                string;
  inlineSnaps:                 number;
  contestedTargets:            number;
  playerGameCount:             number;
  eligibleSeason:              number;
  inlineRate:                  number;
  contestedCatchRate:          number;
  yards:                       number;
  receptions:                  number;
  targetedQbRating:            number;
  interceptions:               number;
  caughtPercent:               number;
  dropRate:                    number;
  gradesHandsDrop:             number;
  slotRate:                    number;
  slotSnaps:                   number;
  penalties:                   number;
  wideRate:                    number;
  passBlockRate:               number;
  team:                        string;
  declinedPenalties:           number;
  routeRate:                   number;
  drops:                       number;
  position:                    string;
  gradesHandsFumble:           number;
  longest:                     number;
  passBlocks:                  number;
  routes:                      number;
  passPlays:                   number;
  yardsPerReception:           number;
  player:                      string;
  franchiseId:                 number;
  contestedReceptions:         number;
  yardsAfterCatch:             number;
  avgDepthOfTarget:            number;
  avoidedTackles:              number;
  playerId:                    number;
  touchdowns:                  number;
}

export interface PffStrengthOfSchedule {
  regularSeason: number;
  playoffs:      number;
  all:           number;
}

export const api = {
  async getPlayers(): Promise<ApiPlayer[]> {
    const response = await fetchWithGodMode(`${API_BASE_URL}/players`)
    if (!response.ok) {
      throw new Error('Failed to fetch players')
    }
    return response.json()
  },

  async getPlayerPffData(playerCbssportsId: number): Promise<{
    passing?: PffPassingStats;
    rushing?: PffRushingStats;
    receiving?: PffReceivingStats;
    strengthOfSchedule: PffStrengthOfSchedule;
  }> {
    const response = await fetchWithGodMode(`${API_BASE_URL}/pff/players/${playerCbssportsId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch player PFF data')
    }
    return response.json()
  },

  async getStrengthOfScheduleRankings(): Promise<StrengthOfScheduleRankings> {
    const response = await fetchWithGodMode(`${API_BASE_URL}/pff/sos`)
    if (!response.ok) {
      throw new Error('Failed to fetch strength of schedule rankings')
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
  async calculateIdealDraft(teamId: number, fetchStarters: boolean = true): Promise<{ starters: IdealDraft[], backups: IdealDraft[] }> {
    const response = await fetchWithGodMode(`${IDEAL_DRAFT_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calculateStarters: fetchStarters,
        calculateBackups: !fetchStarters,
        capForStarters: 200,
        teamId: teamId,
      }),
    })
    if (!response.ok) {
      throw new Error('Failed to calculate ideal draft')
    }
    return response.json()
  },
  async calculateRemainingDraftOptions(teamId: number, skipTier: string, fetchStarters: boolean = true): Promise<{ starters: IdealDraft[], backups: IdealDraft[] }> {
    const response = await fetchWithGodMode(`${IDEAL_DRAFT_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calculateStarters: fetchStarters,
        calculateBackups: !fetchStarters,
        capForStarters: 200,
        teamId: teamId,
        skipTier: skipTier
      }),
    })
    if (!response.ok) {
      throw new Error('Failed to calculate remaining draft options')
    }
    return response.json()
  },
  async calculateIfDraftingOptions(
    teamId: number, 
    position: string, 
    tier: number, 
    salary: number,
    fetchStarters: boolean = true
  ): Promise<{ starters: IdealDraft[], backups: IdealDraft[] }> {
    const response = await fetchWithGodMode(`${IDEAL_DRAFT_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calculateStarters: fetchStarters,
        calculateBackups: !fetchStarters,
        capForStarters: 200,
        teamId: teamId,
        proposedSalary: {
          position,
          tier,
          salary
        }
      }),
    })
    if (!response.ok) {
      throw new Error('Failed to calculate ideal draft options with proposed player')
    }
    return response.json()
  },
}
