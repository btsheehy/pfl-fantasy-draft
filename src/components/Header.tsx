// components/Header.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../hooks/useStore'
import { api } from '../services/api'

const Header: React.FC = () => {
  const { userStore, teamStore, auctionStore } = useStore()
  const refreshData = async () => {
    await auctionStore.fetchAuctionResults()
    await teamStore.fetchTeams()
  }
  const triggerRefresh = async () => {
    await api.triggerRefresh('all')
  }
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            PFL Draft 2024
          </h1>
          <nav className="flex items-center">
            <ul className="flex space-x-6 mr-6">
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
                  to="/players?available=true"
                  className="hover:text-yellow-300 transition duration-200 font-semibold"
                >
                  Players
                </Link>
              </li>
              <li>
                <Link
                  to={'/roster/' + localStorage.getItem('my_team_id')}
                  className="hover:text-yellow-300 transition duration-200 font-semibold"
                >
                  Rosters
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
              {userStore.godMode && (
                <>
                  <li>
                    <Link
                      to="/command-center"
                      className="hover:text-yellow-300 transition duration-200 font-semibold"
                    >
                      Command Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/trade-center"
                      className="hover:text-yellow-300 transition duration-200 font-semibold"
                    >
                      Trade Center
                    </Link>
                  </li>
                </>
              )}
              {process.env.NODE_ENV === 'development' && (
                <li>
                  <button
                    onClick={() => {
                      localStorage.removeItem('my_team_id')
                      localStorage.removeItem('god_mode')
                      window.location.reload()
                    }}
                    className="hover:text-yellow-300 transition duration-200 font-semibold"
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
            {userStore.godMode && (
              <button
                onClick={() => api.triggerRefresh('all')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold p-2 rounded-full transition duration-200 mr-2"
                aria-label="Trigger Refresh for All Users"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={refreshData}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-full transition duration-200"
              aria-label="Refresh Data"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
