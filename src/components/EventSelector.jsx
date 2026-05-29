export default function EventSelector({ events, selectedEventId, onSelectEvent }) {
  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500', color: 'var(--text-main)' }}>
          Evento
        </label>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedEventId}
            onChange={(e) => onSelectEvent(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 2.5rem 0.75rem 1rem',
              fontSize: '1rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface)',
              color: selectedEventId ? 'var(--text-main)' : 'var(--text-muted)',
              outline: 'none',
              appearance: 'none',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              fontWeight: selectedEventId ? '500' : '400'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          >
            <option value="">-- Selecciona un evento --</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
          <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
    </div>
  )
}