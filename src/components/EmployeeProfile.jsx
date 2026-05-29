import { useState, useEffect, useMemo } from 'react'
import { fetchDailySales } from '../services/api'

export default function EmployeeProfile({ user }) {
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filterEmail, setFilterEmail] = useState('')
  const [filterEvent, setFilterEvent] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    
    // dateStr is local YYYY-MM-DD. Convert to proper ISO for backend (start of day)
    const localDate = new Date(dateStr + 'T00:00:00');
    
    fetchDailySales(user.userId, localDate.toISOString())
      .then(res => {
        if (active) setData(res)
      })
      .catch(err => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [user.userId, dateStr])

  const filteredActivity = useMemo(() => {
    if (!data?.activity) return []
    return data.activity.filter(t => {
      const matchEmail = t.buyer?.toLowerCase().includes(filterEmail.toLowerCase()) ?? false
      const matchEvent = t.eventTitle?.toLowerCase().includes(filterEvent.toLowerCase()) ?? false
      return (!filterEmail || matchEmail) && (!filterEvent || matchEvent)
    })
  }, [data, filterEmail, filterEvent])

  const currentTotalTickets = filteredActivity.length
  const currentTotalRevenue = filteredActivity.reduce((acc, t) => acc + (t.price || 0), 0)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)', margin: 0 }}>My Sales Profile</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Seller: {user.fullName || user.email}</p>
          </div>
          
          <div>
            <label style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 500 }}>Select Date</label>
            <input 
              type="date" 
              value={dateStr}
              onChange={e => setDateStr(e.target.value)}
              style={{
                padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                outline: 'none', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            Error loading metrics: {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading metrics...</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px', background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Tickets Sold</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-dark)' }}>{currentTotalTickets}</div>
              </div>
              <div style={{ flex: 1, minWidth: '200px', background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--success)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Revenue</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-dark)' }}>${currentTotalRevenue.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary-dark)' }}>Sales Details</h3>
              
              {/* Filters */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Filter by customer email/name..." 
                  value={filterEmail}
                  onChange={e => setFilterEmail(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', outline: 'none' }}
                />
                <input 
                  type="text" 
                  placeholder="Filter by event..." 
                  value={filterEvent}
                  onChange={e => setFilterEvent(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', outline: 'none' }}
                />
              </div>

              {filteredActivity.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Time</th>
                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Event</th>
                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Seat</th>
                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Customer</th>
                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActivity.map((t) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{new Date(t.time).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(t.time).toLocaleTimeString('es-CO')}</div>
                          </td>
                          <td style={{ padding: '0.75rem' }}>{t.eventTitle}</td>
                          <td style={{ padding: '0.75rem' }}>{t.seat}</td>
                          <td style={{ padding: '0.75rem' }}>{t.buyer}</td>
                          <td style={{ padding: '0.75rem', color: 'var(--success)', fontWeight: 500 }}>${t.price?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                  No sales found for the selected filters.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
