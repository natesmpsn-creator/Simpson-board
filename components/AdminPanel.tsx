'use client'

console.log('AdminPanel component file loading')

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AdminPanelProps {
  familyMembers: any[]
  chores: any[]
  events: any[]
  assignments: any[]
  recurringAssignments: any[]
  onDataChange: () => void
}

export default function AdminPanel({
  familyMembers,
  chores,
  events,
  assignments: initialAssignments,
  recurringAssignments: initialRecurring,
  onDataChange,
}: AdminPanelProps) {
  const [newMember, setNewMember] = useState('')
  const [newChore, setNewChore] = useState('')
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'family' })
  const [newAssignment, setNewAssignment] = useState({ chore_id: '', assigned_to: '', due_date: '' })
  const [newRecurring, setNewRecurring] = useState({ chore_id: '', assigned_to: '', frequency: 'daily', start_date: '' })
  const [assignments, setAssignments] = useState<any[]>(initialAssignments)
  const [recurringAssignments, setRecurringAssignments] = useState<any[]>(initialRecurring)

  const addMember = async () => {
    if (!newMember.trim()) return
    try {
      await supabase.from('family_members').insert({ name: newMember })
      setNewMember('')
      onDataChange()
    } catch (error) {
      console.error('Error adding member:', error)
    }
  }

  const addChore = async () => {
    if (!newChore.trim()) return
    try {
      await supabase.from('chores').insert({ name: newChore, frequency: 'daily' })
      setNewChore('')
      onDataChange()
    } catch (error) {
      console.error('Error adding chore:', error)
    }
  }

  const addEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date) return
    try {
      await supabase.from('calendar_events').insert({
        title: newEvent.title,
        date: newEvent.date,
        type: newEvent.type,
      })
      setNewEvent({ title: '', date: '', type: 'family' })
      onDataChange()
    } catch (error) {
      console.error('Error adding event:', error)
    }
  }

  const deleteMember = async (id: string) => {
    try {
      await supabase.from('family_members').delete().eq('id', id)
      onDataChange()
    } catch (error) {
      console.error('Error deleting member:', error)
    }
  }

  const deleteChore = async (id: string) => {
    try {
      await supabase.from('chores').delete().eq('id', id)
      onDataChange()
    } catch (error) {
      console.error('Error deleting chore:', error)
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      await supabase.from('calendar_events').delete().eq('id', id)
      onDataChange()
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const addAssignment = async () => {
    if (!newAssignment.chore_id || !newAssignment.assigned_to || !newAssignment.due_date) return
    try {
      await supabase.from('assignments').insert({
        chore_id: newAssignment.chore_id,
        assigned_to: newAssignment.assigned_to,
        due_date: newAssignment.due_date,
        completed: false,
      })
      setNewAssignment({ chore_id: '', assigned_to: '', due_date: '' })
      onDataChange()
    } catch (error) {
      console.error('Error adding assignment:', error)
    }
  }

  const deleteAssignment = async (id: string) => {
    try {
      await supabase.from('assignments').delete().eq('id', id)
      onDataChange()
    } catch (error) {
      console.error('Error deleting assignment:', error)
    }
  }

  const getChloreName = (choreId: string) => {
    return chores.find(c => c.id === choreId)?.name || 'Unknown'
  }

  const getMemberName = (memberId: string) => {
    return familyMembers.find(m => m.id === memberId)?.name || 'Unknown'
  }

  const generateAssignmentsFromRecurring = async (recRule: any) => {
    const startDate = new Date(recRule.start_date)
    const assignments = []

    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(currentDate.getDate() + i)
      const dayOfWeek = currentDate.getDay()

      let shouldAssign = false

      if (recRule.frequency === 'daily') {
        shouldAssign = true
      } else if (recRule.frequency === 'every_other_day') {
        shouldAssign = i % 2 === 0
      } else if (recRule.frequency === 'weekday') {
        shouldAssign = dayOfWeek > 0 && dayOfWeek < 6
      } else if (recRule.frequency === 'weekend') {
        shouldAssign = dayOfWeek === 0 || dayOfWeek === 6
      }

      if (shouldAssign) {
        const dateStr = currentDate.toISOString().split('T')[0]
        assignments.push({
          chore_id: recRule.chore_id,
          assigned_to: recRule.assigned_to,
          due_date: dateStr,
          completed: false,
        })
      }
    }

    return assignments
  }

  const addRecurringAssignment = async () => {
    if (!newRecurring.chore_id || !newRecurring.assigned_to || !newRecurring.start_date) return
    try {
      // Save the recurring rule
      const { data: recData } = await supabase
        .from('recurring_assignments')
        .insert({
          chore_id: newRecurring.chore_id,
          assigned_to: newRecurring.assigned_to,
          frequency: newRecurring.frequency,
          start_date: newRecurring.start_date,
        })
        .select()

      // Generate actual assignments for the next 30 days
      const generatedAssignments = await generateAssignmentsFromRecurring(newRecurring)
      await supabase.from('assignments').insert(generatedAssignments)

      setNewRecurring({ chore_id: '', assigned_to: '', frequency: 'daily', start_date: '' })
      onDataChange()
    } catch (error) {
      console.error('Error adding recurring assignment:', error)
    }
  }

  const deleteRecurringAssignment = async (id: string) => {
    try {
      // Delete the recurring rule
      await supabase.from('recurring_assignments').delete().eq('id', id)
      // Note: This doesn't delete existing assignments—they stay until manually removed
      onDataChange()
    } catch (error) {
      console.error('Error deleting recurring assignment:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Family Members */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Family Members</h3>
        <div className="space-y-2 mb-4">
          {familyMembers.map(member => (
            <div key={member.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
              <span>{member.name}</span>
              <button
                onClick={() => deleteMember(member.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMember}
            onChange={e => setNewMember(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && addMember()}
            placeholder="Add member..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={addMember}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* Chores */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Chores</h3>
        <div className="space-y-2 mb-4">
          {chores.map(chore => (
            <div key={chore.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
              <span>{chore.name}</span>
              <button
                onClick={() => deleteChore(chore.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newChore}
            onChange={e => setNewChore(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && addChore()}
            placeholder="Add chore..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={addChore}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* Events */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Events</h3>
        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
          {events.map(event => (
            <div key={event.id} className="flex justify-between items-center bg-gray-50 p-3 rounded text-sm">
              <div>
                <div className="font-medium">{event.title}</div>
                <div className="text-gray-500 text-xs">{event.date}</div>
              </div>
              <button
                onClick={() => deleteEvent(event.id)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <input
            type="text"
            value={newEvent.title}
            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
            placeholder="Title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="date"
            value={newEvent.date}
            onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <select
            value={newEvent.type}
            onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="family">Family</option>
            <option value="birthday">Birthday</option>
            <option value="church">Church</option>
          </select>
          <button
            onClick={addEvent}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            Add Event
          </button>
        </div>
      </div>

      {/* Recurring Assignments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recurring</h3>
        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
          {recurringAssignments.map(rec => (
            <div key={rec.id} className="flex justify-between items-start bg-gray-50 p-3 rounded text-sm">
              <div>
                <div className="font-medium">{getChloreName(rec.chore_id)}</div>
                <div className="text-gray-600 text-xs">{getMemberName(rec.assigned_to)}</div>
                <div className="text-gray-500 text-xs capitalize">{rec.frequency.replace('_', ' ')}</div>
              </div>
              <button
                onClick={() => deleteRecurringAssignment(rec.id)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <select
            value={newRecurring.chore_id}
            onChange={e => setNewRecurring({ ...newRecurring, chore_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Select chore...</option>
            {chores.map(chore => (
              <option key={chore.id} value={chore.id}>
                {chore.name}
              </option>
            ))}
          </select>
          <select
            value={newRecurring.assigned_to}
            onChange={e => setNewRecurring({ ...newRecurring, assigned_to: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Assign to...</option>
            {familyMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <select
            value={newRecurring.frequency}
            onChange={e => setNewRecurring({ ...newRecurring, frequency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="daily">Every Day</option>
            <option value="every_other_day">Every Other Day</option>
            <option value="weekday">Weekdays (Mon-Fri)</option>
            <option value="weekend">Weekends (Sat-Sun)</option>
          </select>
          <input
            type="date"
            value={newRecurring.start_date}
            onChange={e => setNewRecurring({ ...newRecurring, start_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={addRecurringAssignment}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            Set Recurring
          </button>
        </div>
      </div>

      {/* One-time Assignments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">One-Time</h3>
        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
          {assignments.map(assignment => (
            <div key={assignment.id} className="flex justify-between items-start bg-gray-50 p-3 rounded text-sm">
              <div>
                <div className="font-medium">{getChloreName(assignment.chore_id)}</div>
                <div className="text-gray-600 text-xs">{getMemberName(assignment.assigned_to)}</div>
                <div className="text-gray-500 text-xs">{assignment.due_date}</div>
              </div>
              <button
                onClick={() => deleteAssignment(assignment.id)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <select
            value={newAssignment.chore_id}
            onChange={e => setNewAssignment({ ...newAssignment, chore_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Select chore...</option>
            {chores.map(chore => (
              <option key={chore.id} value={chore.id}>
                {chore.name}
              </option>
            ))}
          </select>
          <select
            value={newAssignment.assigned_to}
            onChange={e => setNewAssignment({ ...newAssignment, assigned_to: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Assign to...</option>
            {familyMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={newAssignment.due_date}
            onChange={e => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={addAssignment}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  )
}
