const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

export const purchasePosTickets = async (email, fullName, phone, eventId, areaId, seats) => {
  const response = await fetch(`${API_URL}/tickets/purchase-pos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, fullName, phone, eventId, areaId, seats })
  });
  if (!response.ok) throw new Error('Failed to purchase tickets');
  return response.json();
};
