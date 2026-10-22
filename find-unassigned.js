const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pcmrddppvkjvtkwscyud.supabase.co',
  'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'
)

async function check() {
  const today = new Date().toISOString().split('T')[0]
  
  // Get all chores
  const { data: allChores } = await supabase
    .from('chores')
    .select('id, name')
    .order('name')

  // Get all chores that have assignments today
  const { data: assignedToday } = await supabase
    .from('assignments')
    .select('chore_id')
    .eq('due_date', today)

  const assignedChoreIds = new Set(assignedToday.map(a => a.chore_id))

  console.log('Chores WITHOUT any assignments for today:')
  console.log('=' .repeat(50))
  
  const unassigned = allChores.filter(c => !assignedChoreIds.has(c.id))
  
  if (unassigned.length === 0) {
    console.log('✅ All chores have assignments!')
  } else {
    unassigned.forEach(c => {
      console.log(`❌ ${c.name}`)
    })
    console.log(`\nTotal unassigned: ${unassigned.length}`)
  }
}

check()
