import { getBookings } from "@/services/bookingsApi.ts";
import { Booking } from "@/types/type.ts";
import { useEffect, useState } from "react";

export default function IndexTest() {
  const [data, setData] = useState<Booking[]>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

useEffect (() => {
  
  if(status === "loading") getBookings().then ((booking)=> {
    setData(booking);
    setStatus("ready");
   }).catch((error) => {
    setError(error);
    setStatus("error");
   }) 

}, []);

if (status === "loading") return <div> Laddar... </div>
if (status === "error")  return <div> Fel: {error}</div>

const formatDateTime = (dateTimeString: String) => {
  return dateTimeString.slice(0, dateTimeString.length-3)
}

return (
  <div className="p-6">
    <h1 className="text-xl font-bold">Bokningar</h1>

    <ul className="mt-4 space-y-2">
      {data.map((b, i) => (
        <li key={b.id ?? i} className="rounded border p-3">
          <div className="font-medium">{b.service_type ?? b.service_type}</div>
          <div className="text-sm opacity-80">
            {formatDateTime(new Date(b.start_dt).toLocaleString())} - 
            {formatDateTime(new Date(b.end_dt).toLocaleTimeString())} <br />
            {b.status} • {b.phone_last4}
            
          </div>
        </li>
      ))}
    </ul>
  </div>
);


}