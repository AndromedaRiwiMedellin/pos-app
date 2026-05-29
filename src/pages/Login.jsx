import { useState } from 'react'
import { posLogin } from '../services/api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await posLogin(email, password)
      onLogin(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--surface)', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'var(--primary-dark)', 
            color: 'var(--accent)', 
            width: '60px', 
            height: '60px', 
            borderRadius: '12px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: '0 auto 1rem'
          }}>
            O
          </div>
          <h1 style={{ color: 'var(--primary-dark)', fontSize: '2rem', margin: 0, letterSpacing: '-0.5px' }}>
            Orbix <span style={{ color: 'var(--primary)', fontWeight: '500' }}>POS</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Sign in to continue</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)', fontSize: '0.95rem' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              style={{
                width: '100%', padding: '0.75rem 1rem', fontSize: '1rem',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                background: 'var(--surface)', color: 'var(--text-main)',
                outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)', fontSize: '0.95rem' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '0.75rem 1rem', fontSize: '1rem',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                background: 'var(--surface)', color: 'var(--text-main)',
                outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1rem', fontSize: '1rem', fontWeight: '600',
              background: 'var(--primary)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-md)', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '1rem', transition: 'background 0.2s'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.background = 'var(--primary-dark)')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.background = 'var(--primary)')}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
