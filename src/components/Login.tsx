import React, { useState, useEffect } from 'react'

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
    const params = new URLSearchParams(window.location.search)
    const magicLink = params.get('passphrase')
    if (magicLink && passphrases[magicLink as keyof typeof passphrases]) {
      handleLogin(params.get('passphrase') || '')
    }
  }, [])

  const handleLogin = (phrase: string) => {
    const team = passphrases[phrase as keyof typeof passphrases]
    if (team) {
      localStorage.setItem('my_team_id', team)
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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
        placeholder="Enter passphrase"
      />
      <button type="submit">Login</button>
    </form>
  )
}

export default Login
