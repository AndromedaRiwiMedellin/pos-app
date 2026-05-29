import { useState, useEffect } from 'react'
import POS from './pages/POS'
import Login from './pages/Login'

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('posUser')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('posUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('posUser')
    }
  }, [user])

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return <POS user={user} onLogout={() => setUser(null)} />
}

export default App