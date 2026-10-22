'use client'

console.log('ChoreBoard component file loading')

import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

interface ChoreBoardProps {
  chores: any[]
  assignments: any[]
  familyMembers: any[]
  onUpdate: () => void
  selectedDate: string
}

export default function ChoreBoard({
  chores,
  assignments,
  familyMembers,
  onUpdate,
  selectedDate,
}: ChoreBoardProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const toggleChore = async (assignmentId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('assignments')
        .update({ completed: !currentStatus })
        .eq('id', assignmentId)
      onUpdate()
    } catch (error) {
      console.error('Error updating chore:', error)
    }
  }

  const getAssignmentsForChore = (choreId: string) => {
    return assignments.filter(a => a.chore_id === choreId)
  }

  const getAssignee = (assignment: any) => {
    return familyMembers.find(m => m.id === assignment.assigned_to)?.name || 'Unassigned'
  }

  // Filter to only show chores that have at least one assignment for selected date
  const choresThatDay = chores.filter(chore => {
    const choreAssignments = getAssignmentsForChore(chore.id)
    return choreAssignments.some(a => a.due_date === selectedDate)
  })

  // Calculate completion status for selected date
  const allAssignmentsThatDay = assignments.filter(a => a.due_date === selectedDate)
  const completedThatDay = allAssignmentsThatDay.filter(a => a.completed).length
  const completionPercent = allAssignmentsThatDay.length > 0
    ? Math.round((completedThatDay / allAssignmentsThatDay.length) * 100)
    : 0

  const isToday = selectedDate === new Date().toISOString().split('T')[0]
  const isPast = selectedDate < new Date().toISOString().split('T')[0]

  const dateObj = new Date(selectedDate)
  const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {isToday ? "Today's Chores" : isPast ? "Past Chores" : "Upcoming Chores"}
        </h2>
        <p className="text-sm text-gray-600">{dateLabel}</p>
      </div>

      {allAssignmentsThatDay.length > 0 && (
        <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Completion: {completedThatDay}/{allAssignmentsThatDay.length}</span>
            <span className="text-sm font-semibold text-indigo-600">{completionPercent}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                completionPercent === 100 ? 'bg-green-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      )}

      {choresThatDay.length === 0 ? (
        <p className="text-gray-500">No chores assigned for this day.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-indigo-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Chore</th>
                {familyMembers.map(member => (
                  <th key={member.id} className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700 text-sm">
                    {member.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {choresThatDay.map(chore => (
                <tr key={chore.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">
                    {chore.name}
                  </td>
                  {familyMembers.map(member => {
                    const assignment = getAssignmentsForChore(chore.id).find(
                      a => a.assigned_to === member.id && a.due_date === selectedDate
                    )
                    return (
                      <td key={member.id} className="border border-gray-300 px-4 py-3 text-center">
                        {assignment ? (
                          <button
                            onClick={() => toggleChore(assignment.id, assignment.completed)}
                            className={`w-8 h-8 rounded-full border-2 transition flex items-center justify-center mx-auto ${
                              assignment.completed
                                ? 'bg-green-500 border-green-600 text-white'
                                : 'border-gray-300 hover:border-indigo-500'
                            }`}
                          >
                            {assignment.completed && '✓'}
                          </button>
                        ) : null}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
