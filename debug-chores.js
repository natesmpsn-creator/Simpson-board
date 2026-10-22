const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pcmrddppvkjvtkwscyud.supabase.co',
  'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'
)

async function debug() {
  // Get all chores
  const { data: chores } = await supabase
    .from('chores')
    .select('id, name, frequency')
    .order('created_at', { ascending: true })

  console.log('=== ALL CHORES ===')
  chores.forEach(c => console.log(`${c.id.slice(0, 8)}: ${c.name} (${c.frequency})`))

  // Specifically check evening chores
  const eveningChoreNames = [
    'Wash dinner dishes & load dishwasher',
    'Vacuum kitchen floor',
    'Clear & wipe table',
    'Clear & wipe counters',
    'Clear & wipe island',
    'Dry dishes',
    'Put away dishes'
  ]

  console.log('\n=== EVENING CHORES DETAIL ===')
  for (const name of eveningChoreNames) {
    const chore = chores.find(c => c.name === name)
    if (chore) {
      // Check how many recurring assignments exist for this chore
      const { data: recurring } = await supabase
        .from('recurring_assignments')
        .select('id, assigned_to, frequency', { count: 'exact' })
        .eq('chore_id', chore.id)

      // Check how many assignments exist for this chore TODAY
      const today = new Date().toISOString().split('T')[0]
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, assigned_to, due_date', { count: 'exact' })
        .eq('chore_id', chore.id)
        .eq('due_date', today)

      console.log(`\n${name}:`)
      console.log(`  Chore ID: ${chore.id.slice(0, 8)}`)
      console.log(`  Recurring rules: ${recurring.length}`)
      console.log(`  Assignments for ${today}: ${assignments.length}`)
      if (assignments.length > 0) {
        assignments.slice(0, 3).forEach(a => console.log(`    - ${a.assigned_to.slice(0, 8)}`))
      }
    } else {
      console.log(`\n${name}: NOT FOUND`)
    }
  }
}

debug()
