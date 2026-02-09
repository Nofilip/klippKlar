
const baseUrl = import.meta.env.VITE_BOOKINGS_API_URL

// Hämta bokningar.
export async function getBookings() {
  const res = await fetch(`${baseUrl}/bookings`)

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text ? `- ${text}` : ""}`);
  }

  return res.json();
}



