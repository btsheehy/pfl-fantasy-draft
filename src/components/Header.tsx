// components/Header.tsx
import React from "react"
import { Link } from "react-router-dom"

const Header: React.FC = () => {
	return (
		<header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
			<div className="container mx-auto px-4 py-4">
				<div className="flex justify-between items-center">
					<h1
						className="text-3xl font-bold"
						style={{ fontFamily: "'Poppins', sans-serif" }}
					>
						Fantasy Football Auction
					</h1>
					<nav>
						<ul className="flex space-x-6">
							<li>
								<Link
									to="/"
									className="hover:text-yellow-300 transition duration-200 font-semibold"
								>
									Dashboard
								</Link>
							</li>
							<li>
								<Link
									to="/players"
									className="hover:text-yellow-300 transition duration-200 font-semibold"
								>
									Players
								</Link>
							</li>
							<li>
								<Link
									to="/roster"
									className="hover:text-yellow-300 transition duration-200 font-semibold"
								>
									My Roster
								</Link>
							</li>
							<li>
								<Link
									to="/auction"
									className="hover:text-yellow-300 transition duration-200 font-semibold"
								>
									Auction Room
								</Link>
							</li>
						</ul>
					</nav>
				</div>
			</div>
		</header>
	)
}

export default Header
