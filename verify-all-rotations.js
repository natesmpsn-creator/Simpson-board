const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pcmrddppvkjvtkwscyud.supabase.co',
  'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'
)

async function verify() {
  const chores = [
    'Clear & wipe counters',
    'Clear & wipe island',
    'Dry dishes',
    'Put away dishes',
    'Clear & wipe table'
  ]

  for (const choreName of chores) {
    const { data: choreData } = await supabase
      .from('chores')
      .select('id')
      .eq('name', choreName)

    if (choreData.length === 0) continue

    const { data: assignments } = await supabase
      .from('assignments')
      .select('due_date, family_members(name)')
      .eq('chore_id', choreData[0].id)
      .gte('due_date', '2026-10-22')
      .lte('due_date', '2026-10-31')
      .order('due_date')

    console.log(`\n${choreName} - Next 10 days:`)
    assignments.slice(0, 10).forEach(a => {
      console.log(`  ${a.due_date}: ${a.family_members?.name}`)
    })
  }
}

verify()
