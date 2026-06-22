import { useState } from 'react'
import '../styles/BookingForm.css'

export default function BookingForm({ onBook }) {
  const [formData, setFormData] = useState({
    departure: '',
    arrival: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    tripType: 'roundtrip'
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.departure.trim()) newErrors.departure = 'Departure city is required'
    if (!formData.arrival.trim()) newErrors.arrival = 'Arrival city is required'
    if (!formData.departureDate) newErrors.departureDate = 'Departure date is required'
    if (formData.tripType === 'roundtrip' && !formData.returnDate) {
      newErrors.returnDate = 'Return date is required for round trips'
    }
    if (formData.passengers < 1) newErrors.passengers = 'At least 1 passenger required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onBook?.(formData)
    
    setFormData({
      departure: '',
      arrival: '',
      departureDate: '',
      returnDate: '',
      passengers: 1,
      tripType: 'roundtrip'
    })
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h2>Search Flights</h2>
      
      <div className="form-group">
        <label>Trip Type</label>
        <div className="trip-type-options">
          <label className="radio-label">
            <input
              type="radio"
              name="tripType"
              value="roundtrip"
              checked={formData.tripType === 'roundtrip'}
              onChange={handleChange}
            />
            Round Trip
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="tripType"
              value="oneway"
              checked={formData.tripType === 'oneway'}
              onChange={handleChange}
            />
            One Way
          </label>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="departure">From (Departure City)</label>
          <input
            id="departure"
            type="text"
            name="departure"
            placeholder="e.g., New York"
            value={formData.departure}
            onChange={handleChange}
          />
          {errors.departure && <span className="error">{errors.departure}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="arrival">To (Arrival City)</label>
          <input
            id="arrival"
            type="text"
            name="arrival"
            placeholder="e.g., Los Angeles"
            value={formData.arrival}
            onChange={handleChange}
          />
          {errors.arrival && <span className="error">{errors.arrival}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="departureDate">Departure Date</label>
          <input
            id="departureDate"
            type="date"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleChange}
          />
          {errors.departureDate && <span className="error">{errors.departureDate}</span>}
        </div>

        {formData.tripType === 'roundtrip' && (
          <div className="form-group">
            <label htmlFor="returnDate">Return Date</label>
            <input
              id="returnDate"
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
            />
            {errors.returnDate && <span className="error">{errors.returnDate}</span>}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="passengers">Number of Passengers</label>
        <select
          id="passengers"
          name="passengers"
          value={formData.passengers}
          onChange={handleChange}
        >
          {[1, 2, 3, 4, 5, 6].map(num => (
            <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
          ))}
        </select>
        {errors.passengers && <span className="error">{errors.passengers}</span>}
      </div>

      <button type="submit" className="submit-btn">Search Flights</button>
    </form>
  )
}
