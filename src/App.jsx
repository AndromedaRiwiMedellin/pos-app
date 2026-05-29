import { useState } from 'react'
import POS from './pages/POS'
import Login from './pages/Login'

function App() {
  const [user, setUser] = useState(null)

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return <POS user={user} onLogout={() => setUser(null)} />
}

export default App