import { API_BASE_URL } from './api'

export const commissionerService = {
  async postAuctionResult(result: {
    playerId: number
    winningTeamId: number
    winningBid: number
  }) {
    const response = await fetch(`${API_BASE_URL}/auction-result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    })

    if (!response.ok) {
      throw new Error('Failed to post auction result')
    }

    return response.json()
  },
}
