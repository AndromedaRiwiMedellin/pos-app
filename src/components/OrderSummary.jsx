export default function OrderSummary({ email, event, selectedSeats, onConfirm }) {
  const total = selectedSeats.reduce((acc, seat) => acc + Number(seat.price || 0), 0)

  // Agrupar asientos por zona para mostrarlos ordenados
  const seatsByArea = selectedSeats.reduce((acc, seat) => {
    if (!acc[seat.areaName]) acc[seat.areaName] = []
    acc[seat.areaName].push(seat.seatNumber)
    return acc
  }, {})

  return (
    <div style={{
      background: 'var(--primary-dark)',
      color: 'white',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: 0, color: 'var(--accent)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          Order Summary
        </h3>
      </div>
      
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Customer</span>
          <span style={{ fontWeight: '500', textAlign: 'right' }}>{email || <span style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>No definido</span>}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Event</span>
          <span style={{ fontWeight: '500', textAlign: 'right' }}>{event?.title || '-'}</span>
        </div>
        
        {Object.keys(seatsByArea).map(areaName => (
          <div key={areaName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Zona {areaName} ({seatsByArea[areaName].length})</span>
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '60%' }}>
              {seatsByArea[areaName].map(s => (
                <span key={s} style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        background: 'rgba(0,0,0,0.2)', 
        padding: '1.5rem',
        borderTop: '1px dashed rgba(255,255,255,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>Total to Pay</span>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)', lineHeight: '1' }}>
            ${total.toLocaleString()}
          </span>
        </div>
        
        <button
          onClick={onConfirm}
          disabled={!email || selectedSeats.length === 0}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            background: email && selectedSeats.length > 0 ? 'var(--secondary)' : 'rgba(255,255,255,0.1)',
            color: email && selectedSeats.length > 0 ? 'white' : 'rgba(255,255,255,0.3)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: email && selectedSeats.length > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseOver={(e) => email && selectedSeats.length > 0 && (e.currentTarget.style.background = '#007a73')}
          onMouseOut={(e) => email && selectedSeats.length > 0 && (e.currentTarget.style.background = 'var(--secondary)')}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Cobrar e Imprimir
        </button>
      </div>
    </div>
  )
}