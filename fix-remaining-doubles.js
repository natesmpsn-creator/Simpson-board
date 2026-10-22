const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pcmrddppvkjvtkwscyud.supabase.co',
  'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'
)

async function fixDoubles() {
  console.log('Fixing remaining chore rotation issues...\n')

  const choresNeeded = [
    // 2-person daily rotation (Mom, Brooke)
    { name: 'Clean downstairs bathroom', assignees: ['Mom', 'Brooke'], type: 'daily' },
    { name: 'Mop front area and kitchen', assignees: ['Mom', 'Brooke'], type: 'daily' },
    { name: 'Vacuum stairs', assignees: ['Mom', 'Brooke'], type: 'daily' },
    
    // 2-person 3-day rotation (Bella, Cammi)
    { name: 'Clean mirror and wipe down sink', assignees: ['Bella', 'Cammi'], type: 'every_3_days' },
    
    // 3-person every-other-day (Joe, Nae, Nick)
    { name: 'Wipe down bathroom counter, mirror and toilet', assignees: ['Joe', 'Nae', 'Nick'], type: 'every_other_day' }
  ]

  const { data: allChores } = await supabase.from('chores').select('id, name')
  const { data: allMembers } = await supabase.from('family_members').select('id, name')

  const choreMap = {}
  allChores.forEach(c => { choreMap[c.name] = c.id })

  const memberMap = {}
  allMembers.forEach(m => { memberMap[m.name] = m.id })

  console.log('Deleting old assignments...')
  for (const item of choresNeeded) {
    const choreId = choreMap[item.name]
    if (!choreId) continue
    await supabase.from('assignments').delete().eq('chore_id', choreId)
  }

  const startDate = new Date('2026-10-22')
  const assignmentsToInsert = []

  for (const item of choresNeeded) {
    const choreId = choreMap[item.name]
    if (!choreId) continue

    const assignees = item.assignees.map(name => memberMap[name]).filter(Boolean)
    console.log(`Generating ${item.name} (${item.type})...`)

    for (let day = 0; day < 90; day++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(currentDate.getDate() + day)
      const dateStr = currentDate.toISOString().split('T')[0]

      let shouldAssign = false
      let assigneeIndex = 0

      if (item.type === 'daily') {
        shouldAssign = true
        assigneeIndex = day % assignees.length
      } else if (item.type === 'every_3_days') {
        shouldAssign = (day % 3) === 0 || (day % 3) === 1
        if (day % 3 === 0) assigneeIndex = 0
        else if (day % 3 === 1) assigneeIndex = 1
      } else if (item.type === 'every_other_day') {
        // 3 people, every other day: P0 on day 0,1, P1 on day 2,3, P2 on day 4,5, repeat
        const phase = Math.floor(day / 2) % 3
        shouldAssign = true
        assigneeIndex = phase
      }

      if (shouldAssign) {
        assignmentsToInsert.push({
          chore_id: choreId,
          assigned_to: assignees[assigneeIndex],
          due_date: dateStr,
          completed: false
        })
      }
    }
  }

  console.log(`\nInserting ${assignmentsToInsert.length} assignments...`)
  const batchSize = 500
  for (let i = 0; i < assignmentsToInsert.length; i += batchSize) {
    const batch = assignmentsToInsert.slice(i, i + batchSize)
    const { error } = await supabase.from('assignments').insert(batch)
    if (error) console.error(`Error:`, error)
    else console.log(`✓ Batch ${Math.floor(i/batchSize) + 1}`)
  }

  console.log('\n✅ Done!')
}

fixDoubles()
