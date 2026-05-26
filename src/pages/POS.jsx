import { useState, useEffect } from 'react'
import EmailInput from '../components/EmailInput'
import EventSelector from '../components/EventSelector'
import SeatMap from '../components/SeatMap'
import OrderSummary from '../components/OrderSummary'
import { fetchEvents, fetchEventDetails, purchasePosTickets } from '../services/api'

function POS() {
  const [email, setEmail] = useState('')
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [eventDetails, setEventDetails] = useState(null)
  const [selectedAreaId, setSelectedAreaId] = useState('')
  const [selectedSeats, setSelectedSeats] = useState([])

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
    if (!email || !selectedEventId || !selectedAreaId || selectedSeats.length === 0) return;
    try {
      await purchasePosTickets(email, selectedEventId, selectedAreaId, selectedSeats)
      alert('Venta exitosa! Boleta enviada y cargada a la cuenta.')
      setSelectedSeats([])
      setEmail('')
      // Refresh event details to update available seats
      const data = await fetchEventDetails(selectedEventId)
      setEventDetails(data)
    } catch (error) {
      alert('Error en la venta: ' + error.message)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'left' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Andromeda · Taquilla</h1>

      <div style={{ background: 'var(--social-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <EmailInput
          email={email}
          onChange={setEmail}
        />

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
    </div>
  )
}

export default POS