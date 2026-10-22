const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pcmrddppvkjvtkwscyud.supabase.co',
  'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'
)

async function check() {
  // Check evening dishes rotation (should be Brooke, Joe, Nae taking turns)
  const { data: chores } = await supabase
    .from('chores')
    .select('id, name')
    .eq('name', 'Wash dinner dishes & load dishwasher')

  if (chores.length === 0) return

  const choreId = chores[0].id

  // Get assignments for next 10 days
  const { data: assignments } = await supabase
    .from('assignments')
    .select('due_date, family_members(name)')
    .eq('chore_id', choreId)
    .gte('due_date', '2026-10-22')
    .lte('due_date', '2026-10-31')
    .order('due_date')

  console.log('WASH DINNER DISHES - Next 10 days (should rotate: Brooke → Joe → Nae → Brooke...):')
  assignments.forEach(a => {
    console.log(`  ${a.due_date}: ${a.family_members?.name}`)
  })

  // Check vacuum kitchen floor (should be Nick, Bella alternating)
  const { data: vacChores } = await supabase
    .from('chores')
    .select('id, name')
    .eq('name', 'Vacuum kitchen floor')

  if (vacChores.length > 0) {
    const { data: vacAssignments } = await supabase
      .from('assignments')
      .select('due_date, family_members(name)')
      .eq('chore_id', vacChores[0].id)
      .gte('due_date', '2026-10-22')
      .lte('due_date', '2026-10-31')
      .order('due_date')

    console.log('\nVACUUM KITCHEN FLOOR - Next 10 days (should alternate: Nick → Bella → Nick...):')
    vacAssignments.forEach(a => {
      console.log(`  ${a.due_date}: ${a.family_members?.name}`)
    })
  }

  // Check unload dishwasher (should be Nick, Bella, Cammi rotating)
  const { data: unloadChores } = await supabase
    .from('chores')
    .select('id, name')
    .eq('name', 'Unload dishwasher')

  if (unloadChores.length > 0) {
    const { data: unloadAssignments } = await supabase
      .from('assignments')
      .select('due_date, family_members(name)')
      .eq('chore_id', unloadChores[0].id)
      .gte('due_date', '2026-10-22')
      .lte('due_date', '2026-10-31')
      .order('due_date')

    console.log('\nUNLOAD DISHWASHER - Next 10 days (should rotate: Nick → Bella → Cammi → Nick...):')
    unloadAssignments.forEach(a => {
      console.log(`  ${a.due_date}: ${a.family_members?.name}`)
    })
  }
}

check()
