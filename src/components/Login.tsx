import React, { useState, useEffect } from 'react'
import { FaLock } from 'react-icons/fa'

const passphrases = {
  'smelly cat': '1',
  'happy potato': '2',
  'flying pizza': '3',
  'dancing banana': '4',
  'sleepy koala': '5',
  'grumpy cloud': '6',
  'shiny pebble': '7',
  'fluffy pancake': '8',
  'bouncy castle': '9',
  'squeaky shoe': '10',
  'rusty spoon': '11',
  'wobbly jelly': '12',
}

const Login: React.FC = () => {
  const [passphrase, setPassphrase] = useState('')

  useEffect(() => {
    console.log('running effect')
    const params = new URLSearchParams(window.location.search)
    const magicLink = params.get('passphrase')
    const magicLinkPhrase = magicLink?.split('-').join(' ')
    // Remove passphrase parameter from URL
    if (magicLinkPhrase) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('passphrase');
      window.history.replaceState({}, document.title, newUrl.toString());
    }
    if (magicLinkPhrase && passphrases[magicLinkPhrase as keyof typeof passphrases]) {
      handleLogin(magicLinkPhrase || '')
    }
  }, [window.location.search])

  const handleLogin = (phrase: string) => {
    const team = passphrases[phrase as keyof typeof passphrases]
    if (team) {
      localStorage.setItem('my_team_id', team)
      if (team === '1') {
        localStorage.setItem('god_mode', 'true')
      }
      // refresh the page
      window.location.reload()
    } else {
      alert('Invalid passphrase')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin(passphrase)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Fantasy Football Auction
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="passphrase" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Passphrase
            </label>
            <div className="relative">
              <input
                id="passphrase"
                type="text"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter your secret passphrase"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <FaLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 px-4 rounded-md hover:from-blue-700 hover:to-blue-900 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
