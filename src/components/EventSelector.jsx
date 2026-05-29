import { getImageUrl } from '../services/api'

export default function EventSelector({ events, selectedEventId, onSelectEvent }) {
  if (!events || events.length === 0) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading events...</div>
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {events.map(ev => {
          const isSelected = selectedEventId === ev.id
          const posterSrc = getImageUrl(ev.posterUrl)
          return (
            <div
              key={ev.id}
              onClick={() => onSelectEvent(ev.id)}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected ? '0 8px 24px rgba(0, 169, 165, 0.2)' : 'var(--shadow-sm)'
              }}
            >
              <div style={{ width: '100%', height: '280px', background: 'var(--bg)', position: 'relative' }}>
                {posterSrc ? (
                  <img 
                    src={posterSrc} 
                    alt={ev.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                    No Poster
                  </div>
                )}
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'var(--primary)', color: 'white',
                    width: '28px', height: '28px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ev.title}
                </h3>
                {ev.eventDate && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {new Date(ev.eventDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}