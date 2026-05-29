const API_URL = import.meta.env.VITE_API_URL;

export const fetchEvents = async () => {
  const response = await fetch(`${API_URL}/events`);
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
};

export const fetchEventDetails = async (id) => {
  const response = await fetch(`${API_URL}/events/${id}`);
  if (!response.ok) throw new Error('Failed to fetch event details');
  return response.json();
};

export const checkEmail = async (email) => {
  const response = await fetch(`${API_URL}/auth/check-email?email=${encodeURIComponent(email)}`);
  if (!response.ok) throw new Error('Failed to check email');
  return response.json();
};

export const purchasePosTickets = async (email, fullName, phone, eventId, areaId, seats, sellerId) => {
  const response = await fetch(`${API_URL}/tickets/purchase-pos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, fullName, phone, eventId, areaId, seats, sellerId })
  });
  if (!response.ok) throw new Error('Failed to purchase tickets');
  return response.json();
};

export const fetchTicket = async (id) => {
  const response = await fetch(`${API_URL}/tickets/${id}`);
  if (!response.ok) throw new Error('Failed to fetch ticket');
  return response.json();
};

export const printTicketDirect = async (id) => {
  const response = await fetch(`${API_URL}/tickets/${id}/print`, { method: 'POST' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al imprimir');
  return data;
};

export const posLogin = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/pos-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error en el login');
  return data;
};

export const fetchDailySales = async (sellerId) => {
  const response = await fetch(`${API_URL}/tickets/daily-sales?sellerId=${sellerId}`);
  if (!response.ok) throw new Error('Failed to fetch daily sales');
  return response.json();
};
