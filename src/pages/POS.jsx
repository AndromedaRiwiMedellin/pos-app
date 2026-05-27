import { useState, useEffect } from 'react'
import EmailInput from '../components/EmailInput'
import EventSelector from '../components/EventSelector'
import SeatMap from '../components/SeatMap'
import OrderSummary from '../components/OrderSummary'
import TicketPrint from '../components/TicketPrint/TicketPrint'
import { fetchEvents, fetchEventDetails, purchasePosTickets, fetchTicket, printTicketDirect } from '../services/api'

function POS() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [userStatus, setUserStatus] = useState(null)

  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [eventDetails, setEventDetails] = useState(null)
  const [selectedAreaId, setSelectedAreaId] = useState('')
  const [selectedSeats, setSelectedSeats] = useState([])

  // Estado post-compra
  const [purchasedTickets, setPurchasedTickets] = useState([])
  const [printTicket, setPrintTicket] = useState(null)
  const [loadingPrint, setLoadingPrint] = useState(false)
  const [printStatus, setPrintStatus] = useState(null)   // { type: 'info'|'error'|'ok', msg }

  useEffect(() => {
    fetchEvents().then(setEvents).catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedEventId) {
      fetchEventDetails(selectedEventId).then(data => {
        setEventDetails(data)
        setSelectedAreaId('')
        setSelectedSeats([])
      }).catch(console.error)
    } else {
      setEventDetails(null)
      setSelectedAreaId('')
      setSelectedSeats([])
    }
  }, [selectedEventId])

  useEffect(() => {
    setSelectedSeats([])
  }, [selectedAreaId])

  const handleConfirm = async () => {
    if (!email || !selectedEventId || !selectedAreaId || selectedSeats.length === 0) return
    if (userStatus === 'new' && !fullName) {
      alert('Por favor ingrese el nombre completo del cliente.')
      return
    }

    try {
      const result = await purchasePosTickets(email, fullName, phone, selectedEventId, selectedAreaId, selectedSeats)
      setPurchasedTickets(result.tickets || [])

      // Cargar el primer ticket para previsualización inmediata
      if (result.tickets?.length > 0) {
        setLoadingPrint(true)
        const ticketData = await fetchTicket(result.tickets[0].id)
        setPrintTicket(ticketData)
        setLoadingPrint(false)
      }

      // Limpiar selección
      setSelectedSeats([])
      setEmail('')
      setFullName('')
      setPhone('')
      setUserStatus(null)

      // Refrescar asientos del evento
      const data = await fetchEventDetails(selectedEventId)
      setEventDetails(data)
    } catch (error) {
      alert('Error en la venta: ' + error.message)
    }
  }

  const handlePrintTicket = async (ticketId) => {
    setLoadingPrint(true)
    setPrintStatus({ type: 'info', msg: '⏳ Enviando a impresora...' })
    try {
      // Cargar vista previa
      const data = await fetchTicket(ticketId)
      setPrintTicket(data)
      // Llamar al backend para imprimir directo via CUPS (sin diálogo)
      const result = await printTicketDirect(ticketId)
      setPrintStatus({ type: 'ok', msg: result.message })
    } catch (error) {
      setPrintStatus({ type: 'error', msg: `❌ ${error.message}` })
    } finally {
      setLoadingPrint(false)
    }
  }

  const handleNewSale = () => {
    setPurchasedTickets([])
    setPrintTicket(null)
    setPrintStatus(null)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'left' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Andromeda · Taquilla</h1>

      {/* ── Confirmación post-venta ── */}
      {purchasedTickets.length > 0 ? (
        <div style={{ background: 'var(--social-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>✓ Venta exitosa — {purchasedTickets.length} ticket(s)</h3>

          {/* ── Barra de estado de impresión ── */}
          {printStatus && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '8px',
              background: printStatus.type === 'error' ? '#fee2e2'
                        : printStatus.type === 'ok'    ? '#d1fae5'
                        : '#eff6ff',
              color:      printStatus.type === 'error' ? '#b91c1c'
                        : printStatus.type === 'ok'    ? '#065f46'
                        : '#1e40af',
              border: `1px solid ${
                printStatus.type === 'error' ? '#fca5a5'
              : printStatus.type === 'ok'    ? '#6ee7b7'
              : '#bfdbfe'}
            `}}>
              {loadingPrint && printStatus.type === 'info' && (
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
              )}
              <span style={{ fontWeight: '500' }}>{printStatus.msg}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {purchasedTickets.map((t) => (
              <div key={t.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem', background: 'var(--bg)',
                borderRadius: '8px', border: '1px solid var(--border)'
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  #{t.id.slice(0, 8).toUpperCase()} · Asiento {t.seatNumber}
                </span>
                <button
                  onClick={() => handlePrintTicket(t.id)}
                  disabled={loadingPrint}
                  style={{
                    padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: 'bold',
                    background: loadingPrint ? 'var(--border)' : 'var(--accent)',
                    color: 'white', border: 'none', borderRadius: '6px',
                    cursor: loadingPrint ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loadingPrint ? 'Cargando...' : '🖨 Imprimir'}
                </button>
              </div>
            ))}
          </div>

          {/* Preview oculta del ticket actual (para impresión) */}
          <div ref={printRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
            {printTicket && <TicketPrint ticket={printTicket} />}
          </div>

          {/* Preview visible */}
          {printTicket && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text)' }}>
                PREVISUALIZACIÓN
              </p>
              <TicketPrint ticket={printTicket} />
            </div>
          )}

          <button
            onClick={handleNewSale}
            style={{
              width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: 'bold',
              background: 'var(--border)', color: 'var(--text-h)',
              border: 'none', borderRadius: '6px', cursor: 'pointer'
            }}
          >
            + Nueva Venta
          </button>
        </div>
      ) : (
        /* ── Formulario de venta ── */
        <div style={{ background: 'var(--social-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <EmailInput
            email={email}
            onChange={(v) => { setEmail(v); setUserStatus(null) }}
            onUserFound={(name) => { setUserStatus('found'); setFullName(name) }}
            onNewUser={() => { setUserStatus('new'); setFullName(''); setPhone('') }}
          />

          {userStatus === 'new' && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nombre Completo *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  style={{
                    width: '100%', padding: '0.75rem', fontSize: '1rem',
                    border: '1px solid var(--border)', borderRadius: '6px',
                    background: 'var(--bg)', color: 'var(--text-h)'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Teléfono (Opcional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 3001234567"
                  style={{
                    width: '100%', padding: '0.75rem', fontSize: '1rem',
                    border: '1px solid var(--border)', borderRadius: '6px',
                    background: 'var(--bg)', color: 'var(--text-h)'
                  }}
                />
              </div>
            </div>
          )}

          <EventSelector
            events={events}
            selectedEventId={selectedEventId}
            onSelectEvent={setSelectedEventId}
            eventDetails={eventDetails}
            selectedAreaId={selectedAreaId}
            onSelectArea={setSelectedAreaId}
          />

          {selectedAreaId && eventDetails && (
            <SeatMap
              area={eventDetails.areas.find(a => a.id === Number(selectedAreaId))}
              selectedSeats={selectedSeats}
              onSeatToggle={(seat) =>
                setSelectedSeats(prev =>
                  prev.includes(seat)
                    ? prev.filter(s => s !== seat)
                    : [...prev, seat]
                )
              }
            />
          )}

          {selectedSeats.length > 0 && (
            <OrderSummary
              email={email}
              event={eventDetails?.event}
              area={eventDetails?.areas.find(a => a.id === Number(selectedAreaId))}
              seats={selectedSeats}
              onConfirm={handleConfirm}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default POS