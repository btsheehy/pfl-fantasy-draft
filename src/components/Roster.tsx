// components/Roster.tsx
import React, { useState } from "react"

interface Player {
	id: number
	name: string
	position: string
	status: "active" | "practice" | "IR"
}

const Roster: React.FC = () => {
	const [roster, setRoster] = useState<Player[]>([
		{ id: 1, name: "Tom Brady", position: "QB", status: "active" },
		{ id: 2, name: "Derrick Henry", position: "RB", status: "active" },
		{ id: 3, name: "Davante Adams", position: "WR", status: "active" },
		{ id: 4, name: "Travis Kelce", position: "TE", status: "active" },
		{ id: 5, name: "San Francisco 49ers", position: "DEF", status: "active" },
		{ id: 6, name: "Justin Tucker", position: "K", status: "active" },
		{ id: 7, name: "Rookie Player", position: "WR", status: "practice" },
		{ id: 8, name: "Injured Star", position: "RB", status: "IR" },
	])

	const renderRosterSection = (title: string, players: Player[]) => (
		<div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
			<div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6">
				<h3 className="text-xl font-semibold">{title}</h3>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-100">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Name
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Position
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{players.map((player) => (
							<tr key={player.id}>
								<td className="px-6 py-4 whitespace-nowrap">{player.name}</td>
								<td className="px-6 py-4 whitespace-nowrap">
									{player.position}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)

	const activeRoster = roster.filter((player) => player.status === "active")
	const practiceSquad = roster.filter((player) => player.status === "practice")
	const injuredReserve = roster.filter((player) => player.status === "IR")

	return (
		<div className="space-y-8">
			<h2
				className="text-3xl font-bold mb-6"
				style={{ fontFamily: "'Poppins', sans-serif" }}
			>
				My Roster
			</h2>
			{renderRosterSection("Active Roster", activeRoster)}
			{renderRosterSection("Practice Squad", practiceSquad)}
			{renderRosterSection("Injured Reserve", injuredReserve)}
		</div>
	)
}

export default Roster
