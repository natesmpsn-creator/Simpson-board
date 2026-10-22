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
    .order('name')

  // Get chores with assignments today
  const { data: assignedToday } = await supabase
    .from('assignments')
    .select('chore_id')
    .eq('due_date', today)

  const assignedChoreIds = new Set(assignedToday.map(a => a.chore_id))

  console.log('CHORES WITHOUT TODAY\'S ASSIGNMENTS:')
  console.log('=' .repeat(60))
  
  const unassigned = allChores.filter(c => !assignedChoreIds.has(c.id))
  
  const oldChores = [
    'Load evening dishes',
    'Load Lunch dishes', 
    'Clear and wipe island and counters',
    'Wash Dishes',
    'Instrument Practice'
  ]

  console.log('\nOLD CHORES (should delete):')
  unassigned.filter(c => oldChores.includes(c.name)).forEach(c => {
    console.log(`DELETE: ${c.name} (${c.frequency})`)
  })

  console.log('\nWIFE\'S CHORES (correct - weekly/twice weekly, not today):')
  unassigned.filter(c => !oldChores.includes(c.name)).forEach(c => {
    console.log(`KEEP: ${c.name} (${c.frequency})`)
  })
}

check()
