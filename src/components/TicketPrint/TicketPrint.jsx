import { QRCodeSVG } from 'qrcode.react'
import './TicketPrint.css'

const SEP = () => <hr className="ticket__sep" />

const fmt = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Row({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div className="ticket__row">
      <span className="ticket__label">{label}</span>
      <span className="ticket__value">{value}</span>
    </div>
  )
}

export default function TicketPrint({ tickets }) {
  if (!tickets || tickets.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {tickets.map((ticket, index) => (
        <div key={ticket.id || index} className="ticket">
          {/* Header */}
          <div className="ticket__header">
            <div className="ticket__title">ORBIX</div>
            <div className="ticket__event">{ticket.eventTitle}</div>
          </div>

          <SEP />

          {/* QR */}
          <div className="ticket__qr">
            <QRCodeSVG value={ticket.qrCode} size={140} level="H" />
          </div>

          <SEP />

          {/* Detalles */}
          <div className="ticket__details">
            <Row label="Date"    value={fmt(ticket.eventDate)} />
            {ticket.seatNumber && <Row label="Seat" value={ticket.seatNumber} />}
            <Row label="Holder"  value={ticket.holderName} />
            <Row label="Purchase" value={fmt(ticket.purchasedAt)} />
          </div>

          <SEP />

          {/* Footer */}
          <div className="ticket__footer" style={{ marginBottom: '1rem' }}>
            #{ticket.id.slice(0, 8).toUpperCase()} · {ticket.status?.toUpperCase()}
          </div>
          {index < tickets.length - 1 && (
            <div style={{ margin: '1rem 0', borderTop: '2px dashed #000', width: '100%' }} />
          )}
        </div>
      ))}
    </div>
  )
}
