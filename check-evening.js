const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pcmrddppvkjvtkwscyud.supabase.co',
  'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'
)

async function check() {
  // Get all chores with evening keywords
  const { data: allChores } = await supabase
    .from('chores')
    .select('id, name, frequency')

  const eveningChores = allChores.filter(c => 
    c.name.match(/dish|table|counter|island|kitchen|wipe|clear|dry|load/i)
  )

  console.log('Evening-related chores in DB:')
  eveningChores.forEach(c => console.log(`  - ${c.name} (${c.frequency})`))

  // Get today's assignments for evening chores
  const today = new Date().toISOString().split('T')[0]
  const { data: assignments } = await supabase
    .from('assignments')
    .select(`
      due_date,
      chores (name),
      family_members (name)
    `)
    .eq('due_date', today)
    .in('chore_id', eveningChores.map(c => c.id))

  console.log(`\nAssignments for ${today}:`)
  if (assignments.length === 0) {
    console.log('  (no assignments)')
  } else {
    assignments.forEach(a => {
      console.log(`  ${a.chores.name} → ${a.family_members.name}`)
    })
  }

  // Check recurring assignments for evening chores
  const { data: recurring } = await supabase
    .from('recurring_assignments')
    .select(`
      frequency,
      chores (name),
      family_members (name)
    `)
    .in('chore_id', eveningChores.map(c => c.id))

  console.log(`\nRecurring rules for evening chores (${recurring.length} total):`)
  recurring.forEach(r => {
    console.log(`  ${r.chores.name} → ${r.family_members.name} (${r.frequency})`)
  })
}

check().catch(console.error)
