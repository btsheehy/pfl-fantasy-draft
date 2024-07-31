// components/AuctionRoom.tsx
import React, { useState, useEffect } from "react"

interface Player {
	id: number
	name: string
	position: string
	team: string
	projectedPoints: number
}

interface AuctionResult {
	player: Player
	winningTeam: string
	winningBid: number
}

const AuctionRoom: React.FC = () => {
	const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
	const [auctionResults, setAuctionResults] = useState<AuctionResult[]>([])
	const [timeRemaining, setTimeRemaining] = useState<number>(30)

	// ... (keep the existing useEffect hooks)

	return (
		<div className="space-y-8">
			<h2
				className="text-3xl font-bold mb-6"
				style={{ fontFamily: "'Poppins', sans-serif" }}
			>
				Auction Room
			</h2>

			<div className="bg-white rounded-lg shadow-md overflow-hidden">
				<div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6">
					<h3 className="text-xl font-semibold">Current Auction</h3>
				</div>
				<div className="p-6">
					{currentPlayer ? (
						<div className="text-center">
							<p className="text-3xl font-bold mb-2">{currentPlayer.name}</p>
							<p className="text-xl mb-2">
								{currentPlayer.position} - {currentPlayer.team}
							</p>
							<p className="text-lg mb-4">
								Projected Points: {currentPlayer.projectedPoints}
							</p>
							<div className="bg-yellow-400 text-blue-800 rounded-full py-2 px-4 inline-block font-bold text-xl">
								Time Remaining: {timeRemaining}s
							</div>
						</div>
					) : (
						<p className="text-xl text-center">Waiting for next player...</p>
					)}
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-md overflow-hidden">
				<div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6">
					<h3 className="text-xl font-semibold">Recent Auction Results</h3>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-100">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Player
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Position
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Winning Team
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Winning Bid
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{auctionResults.map((result) => (
								<tr key={result.player.id}>
									<td className="px-6 py-4 whitespace-nowrap">
										{result.player.name}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{result.player.position}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{result.winningTeam}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										${result.winningBid}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

export default AuctionRoom
