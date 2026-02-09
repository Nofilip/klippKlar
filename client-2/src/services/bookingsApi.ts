


// Hämta bokningar.
export async function getBookings() {
  const res = await fetch("http://localhost:3001/api/bookings", 
       
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text ? `- ${text}` : ""}`);
  }

  return res.json();
}



