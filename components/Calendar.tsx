'use client'

console.log('Calendar component file loading')

import { useState, useEffect } from 'react'

interface CalendarProps {
  events: any[]
  onDateSelect: (date: string) => void
  selectedDate: string
}

export default function Calendar({ events, onDateSelect, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  useEffect(() => {
    if (!currentDate) {
      setCurrentDate(new Date())
    }
  }, [])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const displayDate = currentDate || new Date()
  const isInitialized = currentDate !== null
  const monthName = displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const daysInMonth = getDaysInMonth(displayDate)
  const firstDay = getFirstDayOfMonth(displayDate)

  const getEventsForDate = (day: number) => {
    const dateStr = `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'birthday':
        return 'bg-pink-100 text-pink-800'
      case 'family':
        return 'bg-blue-100 text-blue-800'
      case 'church':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Calendar</h2>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1))}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold text-gray-700">{monthName}</h3>
        <button
          onClick={() => setCurrentDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1))}
          className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}

        {days.map((day, idx) => {
          const dateStr = day
            ? `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : null
          const isSelected = dateStr === selectedDate

          return (
            <button
              key={idx}
              onClick={() => dateStr && onDateSelect(dateStr)}
              disabled={!day}
              className={`border rounded-lg p-2 text-sm min-h-20 text-left transition ${
                !day
                  ? 'bg-gray-100 border-gray-100 cursor-default'
                  : isSelected
                  ? 'bg-indigo-600 border-indigo-700 text-white'
                  : 'bg-gray-50 border-gray-200 hover:border-indigo-400 cursor-pointer'
              }`}
            >
              {day && (
                <>
                  <div className={`font-semibold mb-1 ${isSelected ? 'text-white' : 'text-gray-700'}`}>{day}</div>
                  <div className="space-y-1">
                    {getEventsForDate(day).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded ${
                          isSelected ? 'bg-indigo-500 text-white' : getTypeColor(event.type)
                        }`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
