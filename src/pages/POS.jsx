import { useState, useEffect } from 'react'
import orbixLogo from '../assets/orbix-logo.png'
import EmailInput from '../components/EmailInput'
import EventSelector from '../components/EventSelector'
import SeatMap from '../components/SeatMap'
import OrderSummary from '../components/OrderSummary'
import TicketPrint from '../components/TicketPrint/TicketPrint'
import EmployeeProfile from '../components/EmployeeProfile'
import { usePrint } from '../hooks/usePrint'
import { fetchEvents, fetchEventDetails, purchasePosTickets, fetchTicket, fetchDailySales } from '../services/api'

function POS({ user, onLogout }) {
  const [currentView, setCurrentView] = useState('pos')
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
  const [printTickets, setPrintTickets] = useState([])
  const [loadingPrint, setLoadingPrint] = useState(false)
  const [printStatus, setPrintStatus] = useState(null)

  const [showActivity, setShowActivity] = useState(false)

  const { printRef, print } = usePrint()

  const [dailyStats, setDailyStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const loadDailySales = async () => {
    if (!user?.userId) return;
    try {
      const data = await fetchDailySales(user.userId)
      setDailyStats(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchEvents().then(setEvents).catch(console.error)
    loadDailySales()
  }, [user])

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
      alert("Please enter the customer's full name.")
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
        const result = await purchasePosTickets(email, fullName, phone, selectedEventId, parseInt(areaId), grouped[areaId], user.userId);
        allPurchasedTickets = [...allPurchasedTickets, ...(result.tickets || [])];
        
        if (result.emailErrors && result.emailErrors.length > 0) {
          console.error("⚠️ Error enviando boletas por correo:", result.emailErrors);
        }
      }

      setPurchasedTickets(allPurchasedTickets);

      if (allPurchasedTickets.length > 0) {
        setLoadingPrint(true)
        const fetchedTickets = await Promise.all(
          allPurchasedTickets.map(t => fetchTicket(t.id))
        )
        setPrintTickets(fetchedTickets)
        setTimeout(() => {
          print({
            onStatus: (msg) => setPrintStatus({ type: 'info', msg }),
            onError:  (msg) => { setPrintStatus({ type: 'error', msg }); setLoadingPrint(false) },
            onDone:   ()    => { setLoadingPrint(false) }
          })
        }, 300)
        loadDailySales()
      }

      setSelectedSeats([])
      setEmail('')
      setFullName('')
      setPhone('')
      setUserStatus(null)

      const data = await fetchEventDetails(selectedEventId)
      setEventDetails(data)
    } catch (error) {
      alert('Sale error: ' + error.message)
    }
  }

  const handlePrintTicket = async (ticketId) => {
    setLoadingPrint(true)
    setPrintStatus({ type: 'info', msg: 'Loading ticket...' })
    try {
      const data = await fetchTicket(ticketId)
      setPrintTickets([data])
      setTimeout(() => {
        print({
          onStatus: (msg) => setPrintStatus({ type: 'info', msg }),
          onError:  (msg) => { setPrintStatus({ type: 'error', msg }); setLoadingPrint(false) },
          onDone:   ()    => { setLoadingPrint(false) }
        })
      }, 120)
    } catch (error) {
      setPrintStatus({ type: 'error', msg: `Error loading ticket: ${error.message}` })
      setLoadingPrint(false)
    }
  }

  const handleNewSale = () => {
    setPurchasedTickets([])
    setPrintTickets([])
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
            width: '48px', 
            height: '48px', 
            background: 'var(--surface, #ffffff)',
            borderRadius: '10px',
            padding: '4px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <img 
              src={orbixLogo} 
              alt="Orbix Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>
          <h1 style={{ color: 'var(--surface)', fontSize: '1.5rem', margin: 0, letterSpacing: '-0.5px' }}>
            Orbix <span style={{ color: 'var(--accent)', fontWeight: '500' }}>POS</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ color: 'var(--surface)', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setCurrentView('profile')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span style={{ color: 'var(--text-light)' }}>User:</span> {user?.fullName || user?.email || 'Admin'}
          </div>
          <button onClick={() => setCurrentView(currentView === 'pos' ? 'profile' : 'pos')} style={{
            background: 'var(--accent)', color: 'var(--primary-dark)', border: 'none',
            padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.9rem',
            fontWeight: '600', transition: 'background 0.2s'
          }}>
            {currentView === 'pos' ? 'My Metrics' : 'Back to Sales'}
          </button>
          <button onClick={onLogout} style={{
            background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
            padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.9rem',
            transition: 'background 0.2s'
          }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
            Logout
          </button>
        </div>
      </header>

      {currentView === 'profile' ? (
        <EmployeeProfile user={user} />
      ) : (
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
            <h2 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem', fontSize: '2rem' }}>Sale Successful!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
              {purchasedTickets.length} ticket(s) have been generated for this order.
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
                      Seat {t.seatNumber}
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
                    {loadingPrint ? 'Processing...' : 'Print Ticket'}
                  </button>
                </div>
              ))}
            </div>

            <div ref={printRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
              {printTickets.length > 0 && <TicketPrint tickets={printTickets} />}
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
              New Sale
            </button>
          </div>
        ) : (
          /* ── Interfaz Principal (2 Columnas) ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Dashboard superior */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '250px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '500' }}>Tickets Sold Today</h3>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-dark)' }}>
                    {loadingStats ? '...' : dailyStats?.totalTickets || 0}
                  </div>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                </div>
              </div>
              <div style={{ flex: 1, background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '250px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '500' }}>Today's Revenue</h3>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-dark)' }}>
                    ${loadingStats ? '...' : (dailyStats?.totalRevenue || 0).toLocaleString()}
                  </div>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
            </div>

            {/* Actividad Reciente */}
            {dailyStats?.activity && dailyStats.activity.length > 0 && (
              <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <div 
                  onClick={() => setShowActivity(!showActivity)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-dark)', margin: 0, fontWeight: '600' }}>Recent Activity</h3>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: showActivity ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>
                
                {showActivity && (
                  <div style={{ overflowX: 'auto', marginTop: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Time</th>
                          <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Event</th>
                          <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Seat</th>
                          <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Buyer</th>
                          <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Price</th>
                          <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyStats.activity.map((t) => (
                          <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                            <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: '500', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                {new Date(t.time).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                {new Date(t.time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem' }}>{t.eventTitle}</td>
                            <td style={{ padding: '0.75rem' }}>{t.seat}</td>
                            <td style={{ padding: '0.75rem' }}>{t.buyer}</td>
                            <td style={{ padding: '0.75rem', color: 'var(--success)', fontWeight: '500' }}>${t.price}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <button
                                onClick={() => handlePrintTicket(t.id)}
                                style={{ padding: '0.4rem 0.8rem', background: 'var(--bg)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem' }}
                              >
                                Reprint
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Columna Izquierda: Controles */}
            <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Sección 1: Cliente */}
              <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--primary)' }}>1.</span> Customer Details
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
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-main)' }}>Full Name *</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. John Doe"
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
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-main)' }}>Phone (Optional)</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 3001234567"
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
                  <span style={{ color: 'var(--primary)' }}>2.</span> Event Selection
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
                    <span style={{ color: 'var(--primary)' }}>3.</span> Theater Seating
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
          </div>
        )}
      </main>
      )}
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