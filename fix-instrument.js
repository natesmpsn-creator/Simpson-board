const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pcmrddppvkjvtkwscyud.supabase.co',
  'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'
)

async function fix() {
  console.log('Fixing Instrument Practice...\n')

  // Get Instrument Practice chore
  const { data: chores } = await supabase
    .from('chores')
    .select('id')
    .eq('name', 'Instrument Practice ')

  if (chores.length === 0) {
    console.log('Chore not found')
    return
  }

  const choreId = chores[0].id

  // Delete old recurring assignments
  console.log('Deleting old recurring assignments...')
  await supabase
    .from('recurring_assignments')
    .delete()
    .eq('chore_id', choreId)

  // Delete old assignments
  console.log('Deleting old assignments...')
  await supabase
    .from('assignments')
    .delete()
    .eq('chore_id', choreId)

  // Get all family members
  const { data: members } = await supabase
    .from('family_members')
    .select('id, name')
    .in('name', ['Brooke', 'Joe', 'Nae', 'Nick', 'Bella', 'Cammi'])

  console.log(`Found ${members.length} kids\n`)

  // Create daily assignments for next 90 days for each kid
  const startDate = new Date('2026-10-22')
  const assignments = []

  for (let day = 0; day < 90; day++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + day)
    const dateStr = currentDate.toISOString().split('T')[0]

    // Each kid gets assigned every day
    for (const member of members) {
      assignments.push({
        chore_id: choreId,
        assigned_to: member.id,
        due_date: dateStr,
        completed: false
      })
    }
  }

  console.log(`Inserting ${assignments.length} assignments...`)
  const batchSize = 500
  for (let i = 0; i < assignments.length; i += batchSize) {
    const batch = assignments.slice(i, i + batchSize)
    const { error } = await supabase.from('assignments').insert(batch)
    if (error) console.error(`Error:`, error)
    else console.log(`✓ Batch ${Math.floor(i/batchSize) + 1}`)
  }

  console.log('\n✅ Instrument Practice fixed!')
}

fix()
