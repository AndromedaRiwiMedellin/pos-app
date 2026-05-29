import { useState } from 'react'
import { checkEmail } from '../services/api'

export default function EmailInput({ email, onChange, onUserFound, onNewUser }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null) // 'found', 'new', null

  const handleVerify = async () => {
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const data = await checkEmail(email)
      if (data.exists) {
        setStatus('found')
        onUserFound(data.fullName)
      } else {
        setStatus('new')
        onNewUser()
      }
    } catch (err) {
      setError('Error verifying email.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (val) => {
    onChange(val)
    setStatus(null)
    onUserFound(null)
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500', color: 'var(--text-main)' }}>
        Email Address
      </label>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
            </svg>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="cliente@email.com"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              fontSize: '1rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface)',
              color: 'var(--text-main)',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          />
        </div>
        <button
          onClick={handleVerify}
          disabled={!email || loading}
          style={{
            padding: '0 1.5rem',
            background: email ? 'var(--primary-dark)' : 'var(--border)',
            color: email ? 'white' : 'var(--text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: email ? 'pointer' : 'not-allowed',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseOver={(e) => email && !loading && (e.currentTarget.style.background = 'var(--primary)')}
          onMouseOut={(e) => email && !loading && (e.currentTarget.style.background = 'var(--primary-dark)')}
        >
          {loading ? (
            <><span style={{ animation: 'spin 1s linear infinite' }}>⏳</span> Verificando...</>
          ) : 'Verificar'}
        </button>
      </div>
      
      {error && <div style={{ color: 'var(--danger)', marginTop: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        {error}
      </div>}
      
      {status === 'found' && (
        <div style={{ color: 'var(--success)', marginTop: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--success-bg)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          Usuario encontrado. El ticket se enlazará a esta cuenta.
        </div>
      )}
      
      {status === 'new' && (
        <div style={{ color: 'var(--primary-dark)', marginTop: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#e0e7ff', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Usuario nuevo. Por favor ingresa los datos del cliente.
        </div>
      )}
    </div>
  )
}