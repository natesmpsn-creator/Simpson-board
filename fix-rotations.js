const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pcmrddppvkjvtkwscyud.supabase.co',
  'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'
)

async function fixRotations() {
  console.log('Fixing chore rotations...')

  // Define which chores should rotate and with whom
  const rotations = [
    {
      choreName: 'Wash dinner dishes & load dishwasher',
      assignees: ['Brooke', 'Joe', 'Nae'],
      frequency: 'daily'
    },
    {
      choreName: 'Clear & wipe counters',
      assignees: ['Brooke', 'Joe', 'Nae'],
      frequency: 'daily'
    },
    {
      choreName: 'Clear & wipe island',
      assignees: ['Brooke', 'Joe', 'Nae'],
      frequency: 'daily'
    },
    {
      choreName: 'Dry dishes',
      assignees: ['Brooke', 'Joe', 'Nae'],
      frequency: 'daily'
    },
    {
      choreName: 'Put away dishes',
      assignees: ['Brooke', 'Joe', 'Nae'],
      frequency: 'daily'
    },
    {
      choreName: 'Vacuum kitchen floor',
      assignees: ['Nick', 'Bella'],
      frequency: 'daily'
    },
    {
      choreName: 'Clear & wipe table',
      assignees: ['Nick', 'Bella'],
      frequency: 'daily'
    },
    {
      choreName: 'Unload dishwasher',
      assignees: ['Nick', 'Bella', 'Cammi'],
      frequency: 'daily'
    }
  ]

  // Get all chores and members
  const { data: allChores } = await supabase.from('chores').select('id, name')
  const { data: allMembers } = await supabase.from('family_members').select('id, name')

  const choreMap = {}
  allChores.forEach(c => { choreMap[c.name] = c.id })

  const memberMap = {}
  allMembers.forEach(m => { memberMap[m.name] = m.id })

  // Delete old recurring assignments for these chores
  const choreIds = rotations.map(r => choreMap[r.choreName]).filter(Boolean)
  console.log(`\nDeleting old recurring assignments for ${choreIds.length} chores...`)
  
  for (const choreId of choreIds) {
    await supabase
      .from('recurring_assignments')
      .delete()
      .eq('chore_id', choreId)
  }

  // Delete old assignments for these chores
  console.log('Deleting old assignments for rotation chores...')
  for (const choreId of choreIds) {
    await supabase
      .from('assignments')
      .delete()
      .eq('chore_id', choreId)
  }

  // Generate new assignments with proper daily rotation
  console.log('Generating new assignments with proper daily rotation...')
  const startDate = new Date('2026-10-22')
  const assignmentsToInsert = []

  for (const rotation of rotations) {
    const choreId = choreMap[rotation.choreName]
    if (!choreId) {
      console.warn(`Chore not found: ${rotation.choreName}`)
      continue
    }

    const assignees = rotation.assignees.map(name => memberMap[name]).filter(Boolean)
    
    // Generate 90 days of assignments with daily rotation
    for (let day = 0; day < 90; day++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(currentDate.getDate() + day)
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // Rotate through assignees
      const assigneeIndex = day % assignees.length
      const assignedTo = assignees[assigneeIndex]

      assignmentsToInsert.push({
        chore_id: choreId,
        assigned_to: assignedTo,
        due_date: dateStr,
        completed: false
      })
    }

    console.log(`✓ ${rotation.choreName}: ${assignees.length}-day rotation`)
  }

  // Insert in batches to avoid hitting limits
  console.log(`\nInserting ${assignmentsToInsert.length} assignments in batches...`)
  const batchSize = 500
  for (let i = 0; i < assignmentsToInsert.length; i += batchSize) {
    const batch = assignmentsToInsert.slice(i, i + batchSize)
    const { error } = await supabase.from('assignments').insert(batch)
    if (error) {
      console.error(`Error inserting batch ${i/batchSize}:`, error)
    } else {
      console.log(`✓ Inserted batch ${i/batchSize + 1} (${batch.length} assignments)`)
    }
  }

  console.log('\n✅ All rotations fixed!')
}

fixRotations()
