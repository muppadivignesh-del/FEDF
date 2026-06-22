import { useState } from 'react'
import BookingForm from './components/BookingForm'
import './App.css'

function App() {
  const [bookings, setBookings] = useState([])

  const handleBooking = (bookingData) => {
    setBookings([...bookings, bookingData])
    console.log('Booking submitted:', bookingData)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>✈️ Airline Booking Application</h1>
        <p>Book your flights with ease</p>
      </header>
      <main className="app-main">
        <BookingForm onBook={handleBooking} />
        {bookings.length > 0 && (
          <section className="bookings-list">
            <h2>Your Bookings ({bookings.length})</h2>
            <ul>
              {bookings.map((booking, index) => (
                <li key={index} className="booking-item">
                  {booking.departure} → {booking.arrival} on {booking.date}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
