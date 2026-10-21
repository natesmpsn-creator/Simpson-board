'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ChoreBoard from '@/components/ChoreBoard'
import Calendar from '@/components/Calendar'
import AdminPanel from '@/components/AdminPanel'

export const dynamic = 'force-dynamic'

export default function Home() {
  const [familyMembers, setFamilyMembers] = useState<any[]>([])
  const [chores, setChores] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [recurringAssignments, setRecurringAssignments] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [familyRes, choresRes, assignmentsRes, eventsRes, recurringRes] = await Promise.all([
        supabase.from('family_members').select('*'),
        supabase.from('chores').select('*'),
        supabase.from('assignments').select('*'),
        supabase.from('calendar_events').select('*'),
        supabase.from('recurring_assignments').select('*'),
      ])

      if (familyRes.data) {
        const customOrder = ['Brooke', 'Joe', 'Nae', 'Nick', 'Bella', 'Cammi']
        const sorted = familyRes.data.sort((a: any, b: any) => {
          const indexA = customOrder.indexOf(a.name)
          const indexB = customOrder.indexOf(b.name)
          return indexA - indexB
        })
        setFamilyMembers(sorted)
      }
      if (choresRes.data) setChores(choresRes.data)
      if (assignmentsRes.data) setAssignments(assignmentsRes.data)
      if (eventsRes.data) setEvents(eventsRes.data)
      if (recurringRes.data) setRecurringAssignments(recurringRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50" suppressHydrationWarning>
      <header className="bg-white shadow-sm border-b border-gray-200" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-600">Simpson Board</h1>
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition"
          >
            {showAdmin ? 'Done' : 'Edit'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {showAdmin ? (
          <AdminPanel
            familyMembers={familyMembers}
            chores={chores}
            events={events}
            onDataChange={loadData}
            assignments={assignments}
            recurringAssignments={recurringAssignments}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ChoreBoard
                chores={chores}
                assignments={assignments}
                familyMembers={familyMembers}
                onUpdate={loadData}
              />
            </div>
            <div className="lg:col-span-1">
              <Calendar events={events} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
