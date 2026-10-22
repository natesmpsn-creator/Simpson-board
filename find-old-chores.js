const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pcmrddppvkjvtkwscyud.supabase.co',
  'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'
)

async function check() {
  const today = '2026-10-22'
  
  // Get all chores
  const { data: allChores } = await supabase
    .from('chores')
    .select('id, name, frequency')
    .order('created_at')

  // Get chores with assignments today
  const { data: assignedToday } = await supabase
    .from('assignments')
    .select('chore_id')
    .eq('due_date', today)

  const assignedChoreIds = new Set(assignedToday.map(a => a.chore_id))

  // Find unassigned chores and check if they're from the old set
  const oldChoreNames = [
    'Load evening dishes',
    'Load Lunch dishes',
    'Clear and wipe island and counters',
    'Wash Dishes',
    'Instrument Practice'
  ]

  console.log('OLD CHORES TO DELETE (pre-existing, not from wife\'s schedule):')
  console.log('=' .repeat(60))
  
  const toDelete = allChores.filter(c => 
    oldChoreNames.includes(c.name) && !assignedChoreIds.has(c.id)
  )
  
  toDelete.forEach(c => {
    console.log(`ID: ${c.id}`)
    console.log(`Name: ${c.name}`)
    console.log(`Frequency: ${c.frequency}`)
    console.log('---')
  })

  console.log(`\nTotal to delete: ${toDelete.length}`)
}

check()
