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
      setError('Error al verificar el correo.')
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
    <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        Correo del cliente
      </label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="cliente@email.com"
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem',
            fontSize: '1rem',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            background: 'var(--bg)',
            color: 'var(--text-h)'
          }}
        />
        <button
          onClick={handleVerify}
          disabled={!email || loading}
          style={{
            padding: '0 1rem',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: email ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Verificando...' : 'Verificar'}
        </button>
      </div>
      
      {error && <p style={{ color: '#ff4d4f', margin: '0.5rem 0 0' }}>{error}</p>}
      
      {status === 'found' && (
        <p style={{ color: '#10b981', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
          ✓ Usuario encontrado. El ticket se enlazará a esta cuenta.
        </p>
      )}
      
      {status === 'new' && (
        <p style={{ color: 'var(--accent)', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
          ℹ Usuario nuevo. Por favor ingresa los datos del cliente abajo.
        </p>
      )}
    </div>
  )
}