export default function EventSelector({ events, selectedEventId, onSelectEvent, eventDetails, selectedAreaId, onSelectArea }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        Seleccionar Evento
      </label>
      <select
        value={selectedEventId}
        onChange={(e) => onSelectEvent(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          fontSize: '1rem',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          boxSizing: 'border-box',
          background: 'var(--bg)',
          color: 'var(--text-h)',
          marginBottom: '1rem'
        }}
      >
        <option value="">-- Elige un evento --</option>
        {events.map(ev => (
          <option key={ev.id} value={ev.id}>{ev.title}</option>
        ))}
      </select>

      {eventDetails && eventDetails.areas && eventDetails.areas.length > 0 && (
        <>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Seleccionar Área
          </label>
          <select
            value={selectedAreaId}
            onChange={(e) => onSelectArea(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              boxSizing: 'border-box',
              background: 'var(--bg)',
              color: 'var(--text-h)'
            }}
          >
            <option value="">-- Elige un área --</option>
            {eventDetails.areas.map(area => (
              <option key={area.id} value={area.id}>
                {area.areaName} - ${area.price}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  )
}