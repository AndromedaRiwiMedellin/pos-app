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

export const purchasePosTickets = async (email, eventId, areaId, seats) => {
  const response = await fetch(`${API_URL}/tickets/purchase-pos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, eventId, areaId, seats })
  });
  if (!response.ok) throw new Error('Failed to purchase tickets');
  return response.json();
};
