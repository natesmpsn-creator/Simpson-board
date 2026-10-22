const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pcmrddppvkjvtkwscyud.supabase.co',
  'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'
)

async function check() {
  // Get Instrument Practice
  const { data: chores } = await supabase
    .from('chores')
    .select('id, name, frequency')
    .eq('name', 'Instrument Practice ')

  if (chores.length === 0) {
    console.log('Instrument Practice not found')
    return
  }

  console.log('Instrument Practice chore(s):')
  chores.forEach(c => {
    console.log(`  ID: ${c.id}`)
    console.log(`  Frequency: ${c.frequency}`)
  })

  // Check recurring assignments
  const { data: recurring } = await supabase
    .from('recurring_assignments')
    .select('id, assigned_to, frequency, family_members(name)')
    .in('chore_id', chores.map(c => c.id))

  console.log(`\nRecurring assignments: ${recurring.length}`)
  recurring.slice(0, 5).forEach(r => {
    console.log(`  ${r.family_members.name}: ${r.frequency}`)
  })
}

check()
