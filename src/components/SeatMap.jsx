export default function SeatMap({ area, selectedSeats, onSeatToggle }) {
  if (!area || !area.areaSeats) return null

  // Ordenar asientos o simplemente mostrarlos
  const seats = area.areaSeats || []

  return (
    <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold' }}>
        Seleccionar Asientos
      </label>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', 
        gap: '10px' 
      }}>
        {seats.map(seat => {
          const isSelected = selectedSeats.includes(seat.seatNumber)
          const isSold = seat.status === 'sold' || seat.status === 'reserved'
          
          let bgColor = 'var(--code-bg)'
          let color = 'var(--text)'
          let cursor = 'pointer'
          let border = '1px solid var(--border)'

          if (isSold) {
            bgColor = '#ff4d4f'
            color = 'white'
            cursor = 'not-allowed'
            border = '1px solid #ff4d4f'
          } else if (isSelected) {
            bgColor = 'var(--accent)'
            color = 'white'
            border = '1px solid var(--accent)'
          }

          return (
            <button
              key={seat.id}
              disabled={isSold}
              onClick={() => !isSold && onSeatToggle(seat.seatNumber)}
              style={{
                padding: '0.75rem 0',
                background: bgColor,
                color,
                border,
                borderRadius: '6px',
                cursor,
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
              }}
            >
              {seat.seatNumber}
            </button>
          )
        })}
      </div>
      {seats.length === 0 && (
        <p style={{ color: 'var(--text)' }}>No hay asientos disponibles en esta área.</p>
      )}
    </div>
  )
}