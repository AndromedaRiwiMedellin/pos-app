export default function OrderSummary({ email, event, area, seats, onConfirm }) {
  const total = seats.length * (area?.price || 0)

  return (
    <div style={{
      marginTop: '2rem',
      padding: '1.5rem',
      background: 'var(--accent-bg)',
      border: '1px solid var(--accent-border)',
      borderRadius: '8px'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-h)' }}>Resumen de Compra</h3>
      <p style={{ marginBottom: '0.5rem' }}><strong>Cliente:</strong> {email || 'Sin correo'}</p>
      <p style={{ marginBottom: '0.5rem' }}><strong>Evento:</strong> {event?.title}</p>
      <p style={{ marginBottom: '0.5rem' }}><strong>Área:</strong> {area?.areaName}</p>
      <p style={{ marginBottom: '0.5rem' }}><strong>Asientos:</strong> {seats.join(', ')}</p>
      <div style={{ 
        marginTop: '1rem', 
        paddingTop: '1rem', 
        borderTop: '1px solid var(--accent-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-h)' }}>
          Total: ${total.toFixed(2)}
        </span>
        <button
          onClick={onConfirm}
          disabled={!email || seats.length === 0}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            background: email && seats.length > 0 ? 'var(--accent)' : 'var(--border)',
            color: email && seats.length > 0 ? 'white' : 'var(--text)',
            border: 'none',
            borderRadius: '6px',
            cursor: email && seats.length > 0 ? 'pointer' : 'not-allowed',
            transition: 'opacity 0.2s'
          }}
        >
          Cobrar e Imprimir
        </button>
      </div>
    </div>
  )
}