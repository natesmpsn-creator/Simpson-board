'use client'

console.log('ChoreBoard component file loading')

import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

interface ChoreBoardProps {
  chores: any[]
  assignments: any[]
  familyMembers: any[]
  onUpdate: () => void
}

export default function ChoreBoard({
  chores,
  assignments,
  familyMembers,
  onUpdate,
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Chores</h2>

      {chores.length === 0 ? (
        <p className="text-gray-500">No chores yet. Click Edit to add some.</p>
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
              {chores.map(chore => (
                <tr key={chore.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">
                    {chore.name}
                  </td>
                  {familyMembers.map(member => {
                    const today = new Date().toISOString().split('T')[0]
                    const assignment = getAssignmentsForChore(chore.id).find(
                      a => a.assigned_to === member.id && a.due_date === today
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
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
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
