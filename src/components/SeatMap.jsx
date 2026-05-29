export default function SeatMap({ areas, selectedSeats, onSeatToggle }) {
  if (!areas || areas.length === 0) return null;

  // Colores distintivos para cada zona (adaptados a tu paleta)
  const getZoneColors = (index) => {
    const palette = [
      { bg: 'var(--primary)', border: 'var(--primary-dark)', name: 'Azul' },
      { bg: 'var(--secondary)', border: '#007a73', name: 'Verde' },
      { bg: '#aa3bff', border: '#8a1bdf', name: 'Morado' },
      { bg: '#e11d48', border: '#be123c', name: 'Rosa' },
    ];
    return palette[index % palette.length];
  };

  // Extraer la fila (letras al inicio) del número de asiento (ej: "A1" -> "A", "12" -> "Fila")
  const getRow = (seatNumber) => {
    const match = seatNumber.match(/^[A-Za-z]+/);
    return match ? match[0] : 'General';
  };

  // SVG que dibuja una pequeña silla
  const SeatShape = ({ color, isSelected }) => {
    return (
      <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
        {/* Respaldo */}
        <path d="M6 3h12a3 3 0 013 3v6H3V6a3 3 0 013-3z" fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
        {/* Asiento base */}
        <rect x="2" y="12" width="20" height="8" rx="2" fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
        {/* Borde extra para seleccionados (opcional visualmente) */}
        {isSelected && (
          <rect x="0" y="1" width="24" height="22" rx="4" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        )}
      </svg>
    );
  };

  // Procesar todas las áreas
  const zones = areas.map((area, index) => {
    const colors = getZoneColors(index);
    const seats = area.areaSeats || [];
    
    // Agrupar asientos por fila dentro de la zona
    const rows = seats.reduce((acc, seat) => {
      const row = getRow(seat.seatNumber);
      if (!acc[row]) acc[row] = [];
      acc[row].push(seat);
      return acc;
    }, {});

    // Ordenar las filas alfabéticamente
    const sortedRows = Object.keys(rows).sort();

    return {
      ...area,
      colors,
      rows: sortedRows.map(rowKey => ({
        rowKey,
        seats: rows[rowKey].sort((a, b) => {
          // Intentar ordenar numéricamente si es posible
          const numA = parseInt(a.seatNumber.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.seatNumber.replace(/\D/g, '')) || 0;
          return numA - numB;
        })
      }))
    };
  });

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      
      {/* ── MAPA DEL TEATRO (Izquierda) ── */}
      <div style={{ 
        flex: '1 1 60%', 
        background: 'white', 
        padding: '2rem', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        minWidth: '300px'
      }}>
        
        {/* Renderizar cada zona como un bloque de filas centradas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          {zones.map((zone) => (
            <div key={zone.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              {zone.rows.map((row) => (
                <div key={row.rowKey} style={{ display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
                  {row.seats.map(seat => {
                    const isSelected = selectedSeats.some(s => s.areaId === zone.id && s.seatNumber === seat.seatNumber);
                    const isSold = seat.status === 'sold' || seat.status === 'reserved';
                    
                    let bg = isSold ? '#cbd5e1' : zone.colors.bg;
                    let opacity = isSold ? 0.4 : 1;
                    let transform = isSelected ? 'scale(1.2)' : 'scale(1)';
                    // Si está seleccionado, aplicamos un color de la paleta para resaltar (verde lima si es oscuro, azul oscuro si es claro)
                    if (isSelected && !isSold) {
                      bg = 'var(--accent)'; 
                    }

                    return (
                      <button
                        key={seat.id}
                        disabled={isSold}
                        onClick={() => !isSold && onSeatToggle(zone, seat.seatNumber)}
                        style={{
                          width: '18px',  // Un poco más grande para que se vea la forma de la silla
                          height: '18px',
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          cursor: isSold ? 'not-allowed' : 'pointer',
                          opacity: opacity,
                          transform: transform,
                          transition: 'transform 0.15s ease',
                          color: isSelected ? 'var(--primary-dark)' : 'transparent' // Para el borde del SVG si es necesario
                        }}
                        title={`Zona: ${zone.areaName} | Asiento: ${seat.seatNumber} | $${Number(zone.price).toLocaleString()}`}
                        onMouseOver={(e) => !isSold && !isSelected && (e.currentTarget.style.transform = 'scale(1.2)')}
                        onMouseOut={(e) => !isSold && !isSelected && (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <SeatShape color={bg} isSelected={isSelected} />
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ── ESCENARIO (Abajo) ── */}
        <div style={{
          background: 'var(--border)',
          color: 'var(--text-muted)',
          textAlign: 'center',
          padding: '1rem 3rem',
          marginTop: '1rem',
          borderRadius: '4px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          fontSize: '0.9rem',
          width: '60%',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
        }}>
          ESCENARIO
        </div>
      </div>

      {/* ── LEYENDA Y PRECIOS (Derecha) ── */}
      <div style={{ 
        flex: '1 1 30%', 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-dark)' }}>Seleccione un asiento</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Haga clic en las sillas del mapa para elegir sus ubicaciones.
          </p>
        </div>

        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--primary-dark)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
          Rangos de precios
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {zones.map(zone => (
            <div key={zone.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '16px', height: '16px' }}>
                  <SeatShape color={zone.colors.bg} />
                </div>
                <span style={{ fontWeight: '500', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  {zone.areaName.toUpperCase()}
                </span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>
                ${Number(zone.price).toLocaleString()}
              </span>
            </div>
          ))}
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '16px', height: '16px', opacity: 0.5 }}>
                <SeatShape color="#cbd5e1" />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Ocupado / Reservado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}