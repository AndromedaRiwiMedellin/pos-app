import { useState } from 'react'
import EmailInput from '../components/EmailInput'
import EventSelector from '../components/EventSelector'
import SeatMap from '../components/SeatMap'
import OrderSummary from '../components/OrderSummary'

function POS() {
  const [email, setEmail] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Andromeda · Taquilla</h1>

      <EmailInput
        email={email}
        onChange={setEmail}
      />

      <EventSelector
        selectedEvent={selectedEvent}
        onSelect={setSelectedEvent}
      />

      {selectedEvent && (
        <SeatMap
          event={selectedEvent}
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
          event={selectedEvent}
          seats={selectedSeats}
          onConfirm={() => console.log('confirmar venta')}
        />
      )}
    </div>
  )
}

export default POS