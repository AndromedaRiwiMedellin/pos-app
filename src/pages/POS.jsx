import { useState, useEffect } from 'react'
import EmailInput from '../components/EmailInput'
import EventSelector from '../components/EventSelector'
import SeatMap from '../components/SeatMap'
import OrderSummary from '../components/OrderSummary'
import TicketPrint from '../components/TicketPrint/TicketPrint'
import { usePrint } from '../hooks/usePrint'
import { fetchEvents, fetchEventDetails, purchasePosTickets, fetchTicket } from '../services/api'

function POS() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [userStatus, setUserStatus] = useState(null)

  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [eventDetails, setEventDetails] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])

  // Estado post-compra
  const [purchasedTickets, setPurchasedTickets] = useState([])
  const [printTicket, setPrintTicket] = useState(null)
  const [loadingPrint, setLoadingPrint] = useState(false)
  const [printStatus, setPrintStatus] = useState(null)

  const { printRef, print } = usePrint()

  useEffect(() => {
    fetchEvents().then(setEvents).catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedEventId) {
      fetchEventDetails(selectedEventId).then(data => {
        setEventDetails(data)
        setSelectedSeats([])
      }).catch(console.error)
    } else {
      setEventDetails(null)
      setSelectedSeats([])
    }
  }, [selectedEventId])

  const handleSeatToggle = (area, seatNumber) => {
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.areaId === area.id && s.seatNumber === seatNumber)
      if (exists) {
        return prev.filter(s => !(s.areaId === area.id && s.seatNumber === seatNumber))
      } else {
        return [...prev, { areaId: area.id, seatNumber, price: area.price, areaName: area.areaName }]
      }
    })
  }

  const handleConfirm = async () => {
    if (!email || !selectedEventId || selectedSeats.length === 0) return
    if (userStatus === 'new' && !fullName) {
      alert('Por favor ingrese el nombre completo del cliente.')
      return
    }

    try {
      // Agrupar los asientos por areaId para enviar las peticiones a la API
      const grouped = selectedSeats.reduce((acc, seat) => {
        if (!acc[seat.areaId]) acc[seat.areaId] = [];
        acc[seat.areaId].push(seat.seatNumber);
        return acc;
      }, {});

      let allPurchasedTickets = [];

      // Procesar cada zona (Area) independientemente
      for (const areaId in grouped) {
        const result = await purchasePosTickets(email, fullName, phone, selectedEventId, parseInt(areaId), grouped[areaId]);
        allPurchasedTickets = [...allPurchasedTickets, ...(result.tickets || [])];
      }

      setPurchasedTickets(allPurchasedTickets);

      if (allPurchasedTickets.length > 0) {
        setLoadingPrint(true)
        const ticketData = await fetchTicket(allPurchasedTickets[0].id)
        setPrintTicket(ticketData)
        setLoadingPrint(false)
      }

      setSelectedSeats([])
      setEmail('')
      setFullName('')
      setPhone('')
      setUserStatus(null)

      const data = await fetchEventDetails(selectedEventId)
      setEventDetails(data)
    } catch (error) {
      alert('Error en la venta: ' + error.message)
    }
  }

  const handlePrintTicket = async (ticketId) => {
    setLoadingPrint(true)
    setPrintStatus({ type: 'info', msg: 'Cargando ticket...' })
    try {
      const data = await fetchTicket(ticketId)
      setPrintTicket(data)
      setTimeout(() => {
        print({
          onStatus: (msg) => setPrintStatus({ type: 'info', msg }),
          onError:  (msg) => { setPrintStatus({ type: 'error', msg }); setLoadingPrint(false) },
          onDone:   ()    => { setLoadingPrint(false) }
        })
      }, 120)
    } catch (error) {
      setPrintStatus({ type: 'error', msg: `Error al cargar ticket: ${error.message}` })
      setLoadingPrint(false)
    }
  }

  const handleNewSale = () => {
    setPurchasedTickets([])
    setPrintTicket(null)
    setPrintStatus(null)
    setSelectedEventId('')
    setEventDetails(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Header ── */}
      <header style={{ 
        background: 'var(--primary-dark)', 
        color: 'white', 
        padding: '1.25rem 2rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-md)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            background: 'var(--accent)', 
            color: 'var(--primary-dark)', 
            width: '40px', 
            height: '40px', 
            borderRadius: '8px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            O
          </div>
          <h1 style={{ color: 'var(--surface)', fontSize: '1.5rem', margin: 0, letterSpacing: '-0.5px' }}>
            Orbix <span style={{ color: 'var(--accent)', fontWeight: '500' }}>POS</span>
          </h1>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {purchasedTickets.length > 0 ? (
          /* ── Confirmación post-venta ── */
          <div style={{ 
            background: 'var(--surface)', 
            padding: '3rem', 
            borderRadius: 'var(--radius-lg)', 
            boxShadow: 'var(--shadow-lg)',
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '64px', height: '64px', background: 'var(--success-bg)', color: 'var(--success)', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '2rem', margin: '0 auto 1.5rem'
            }}>
              ✓
            </div>
            <h2 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem', fontSize: '2rem' }}>¡Venta Exitosa!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
              Se han generado {purchasedTickets.length} ticket(s) para esta orden.
            </p>

            {printStatus && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                padding: '1rem', marginBottom: '2rem', borderRadius: 'var(--radius-md)',
                background: printStatus.type === 'error' ? 'var(--danger-bg)' : printStatus.type === 'ok' ? 'var(--success-bg)' : '#eff6ff',
                color: printStatus.type === 'error' ? 'var(--danger)' : printStatus.type === 'ok' ? 'var(--success)' : 'var(--primary)',
                fontWeight: '500'
              }}>
                {loadingPrint && printStatus.type === 'info' && (
                  <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                )}
                {printStatus.msg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem', textAlign: 'left' }}>
              {purchasedTickets.map((t) => (
                <div key={t.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1.25rem', background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                      Ticket #{t.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Asiento {t.seatNumber}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePrintTicket(t.id)}
                    disabled={loadingPrint}
                    style={{
                      padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: '600',
                      background: loadingPrint ? 'var(--border)' : 'var(--primary)',
                      color: loadingPrint ? 'var(--text-muted)' : 'white', 
                      border: 'none', borderRadius: 'var(--radius-sm)',
                      cursor: loadingPrint ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => !loadingPrint && (e.currentTarget.style.background = 'var(--primary-dark)')}
                    onMouseOut={(e) => !loadingPrint && (e.currentTarget.style.background = 'var(--primary)')}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    {loadingPrint ? 'Procesando...' : 'Imprimir Ticket'}
                  </button>
                </div>
              ))}
            </div>

            <div ref={printRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
              {printTicket && <TicketPrint ticket={printTicket} />}
            </div>

            <button
              onClick={handleNewSale}
              style={{
                padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: '600',
                background: 'var(--secondary)', color: 'white',
                border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                width: '100%', transition: 'background 0.2s',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#007a73'}
              onMouseOut={(e) => e.currentTarget.style.background = 'var(--secondary)'}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Nueva Venta
            </button>
          </div>
        ) : (
          /* ── Interfaz Principal (2 Columnas) ── */
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Columna Izquierda: Controles */}
            <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Sección 1: Cliente */}
              <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--primary)' }}>1.</span> Datos del Cliente
                </h2>
                <EmailInput
                  email={email}
                  onChange={(v) => { setEmail(v); setUserStatus(null) }}
                  onUserFound={(name) => { setUserStatus('found'); setFullName(name) }}
                  onNewUser={() => { setUserStatus('new'); setFullName(''); setPhone('') }}
                />

                {userStatus === 'new' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-main)' }}>Nombre Completo *</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        style={{
                          width: '100%', padding: '0.75rem 1rem', fontSize: '1rem',
                          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                          background: 'var(--surface)', color: 'var(--text-main)',
                          outline: 'none', transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-main)' }}>Teléfono (Opcional)</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej. 3001234567"
                        style={{
                          width: '100%', padding: '0.75rem 1rem', fontSize: '1rem',
                          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                          background: 'var(--surface)', color: 'var(--text-main)',
                          outline: 'none', transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 2: Evento */}
              <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--primary)' }}>2.</span> Selección de Evento
                </h2>
                <EventSelector
                  events={events}
                  selectedEventId={selectedEventId}
                  onSelectEvent={setSelectedEventId}
                />
              </div>

              {/* Sección 3: Asientos (Todo el Teatro) */}
              {eventDetails && eventDetails.areas && eventDetails.areas.length > 0 && (
                <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--primary)' }}>3.</span> Ubicaciones del Teatro
                  </h2>
                  <SeatMap
                    areas={eventDetails.areas}
                    selectedSeats={selectedSeats}
                    onSeatToggle={handleSeatToggle}
                  />
                </div>
              )}
            </div>

            {/* Columna Derecha: Resumen de Compra (Sticky) */}
            <div style={{ flex: '1 1 35%', minWidth: '300px', position: 'sticky', top: '90px' }}>
              <OrderSummary
                email={email}
                event={eventDetails?.event}
                selectedSeats={selectedSeats}
                onConfirm={handleConfirm}
              />
            </div>
          </div>
        )}
      </main>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default POS