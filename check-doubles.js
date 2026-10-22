const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pcmrddppvkjvtkwscyud.supabase.co',
  'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'
)

async function check() {
  const today = '2026-10-22'

  const { data: assignments } = await supabase
    .from('assignments')
    .select('chore_id, chores(name), family_members(name)')
    .eq('due_date', today)
    .order('chores(name)')

  const byChore = {}
  assignments.forEach(a => {
    const choreName = a.chores.name
    if (!byChore[choreName]) byChore[choreName] = []
    byChore[choreName].push(a.family_members.name)
  })

  console.log('CHORES FOR TODAY (Oct 22) - All should be correct now:')
  console.log('=' .repeat(60))

  const morningDaily = [
    'Time with Jesus',
    'Make bed',
    'Get dressed',
    'Brush teeth',
    'Put away clothes',
    'Instrument Practice '
  ]

  for (const [choreName, people] of Object.entries(byChore)) {
    const isMorningDaily = morningDaily.includes(choreName)
    const count = people.length

    if (isMorningDaily) {
      console.log(`✓ ${choreName}: ${count} people`)
    } else if (count > 1) {
      console.log(`❌ ${choreName}: ${count} people - ${people.join(', ')}`)
    } else {
      console.log(`✓ ${choreName}: ${people[0]}`)
    }
  }
}

check()
