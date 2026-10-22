const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pcmrddppvkjvtkwscyud.supabase.co',
  'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'
)

async function check() {
  const today = new Date('2026-10-22')
  console.log(`Today is: ${today.toLocaleDateString()} (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][today.getDay()]})`)
  
  // Get chore IDs
  const { data: chores } = await supabase
    .from('chores')
    .select('id, name, frequency')
    .in('name', ['Vacuum basement stairs', 'Clean shower', 'Wipe down bathroom'])

  console.log('\nChecking weekly chore assignments for next 10 days:')
  
  for (const chore of chores) {
    const { data: assignments } = await supabase
      .from('assignments')
      .select('due_date')
      .eq('chore_id', chore.id)
      .gte('due_date', '2026-10-20')
      .lte('due_date', '2026-10-31')
      .order('due_date')

    console.log(`\n${chore.name} (${chore.frequency}):`)
    if (assignments && assignments.length > 0) {
      assignments.forEach(a => {
        const d = new Date(a.due_date)
        console.log(`  ${a.due_date} (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]})`)
      })
    } else {
      console.log('  ❌ NO ASSIGNMENTS')
    }
  }
}

check()
