import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns'
import { fr } from 'date-fns/locale'

interface CalendarProps {
  selected?: string // YYYY-MM-DD
  onSelect: (date: string) => void
  minDate?: string
}

export default function Calendar({ selected, onSelect, minDate }: CalendarProps) {
  const [viewDate, setViewDate] = useState(
    selected ? parseISO(selected) : new Date()
  )

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })

  const days: Date[] = []
  let day = startDate
  while (day <= monthEnd || days.length % 7 !== 0) {
    days.push(day)
    day = addDays(day, 1)
    if (days.length > 42) break
  }

  const minD = minDate ? parseISO(minDate) : null

  const DAY_LABELS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

  return (
    <div className="bg-card border border-border rounded-xl p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="text-muted hover:text-white transition-colors p-1"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-white font-gotham font-semibold capitalize">
          {format(viewDate, 'MMMM yyyy', { locale: fr })}
        </span>
        <button
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="text-muted hover:text-white transition-colors p-1"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-muted text-xs font-gotham py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((d, i) => {
          const dateStr = format(d, 'yyyy-MM-dd')
          const isSelected = selected ? isSameDay(d, parseISO(selected)) : false
          const isCurrentMonth = isSameMonth(d, viewDate)
          const isDisabled = minD ? d < minD : false
          const isToday = isSameDay(d, new Date())

          return (
            <button
              key={i}
              onClick={() => !isDisabled && onSelect(dateStr)}
              disabled={isDisabled}
              className={`
                w-8 h-8 mx-auto flex items-center justify-center rounded-lg
                text-sm font-gotham transition-all
                ${isSelected ? 'bg-accent text-black font-bold' : ''}
                ${!isSelected && isToday ? 'border border-accent text-accent' : ''}
                ${!isSelected && !isToday && isCurrentMonth ? 'text-white hover:bg-card2' : ''}
                ${!isCurrentMonth ? 'text-border' : ''}
                ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {format(d, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
