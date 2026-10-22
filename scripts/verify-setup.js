const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://pcmrddppvkjvtkwscyud.supabase.co'
const supabaseKey = 'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
  try {
    const { count: choreCount } = await supabase
      .from('chores')
      .select('*', { count: 'exact', head: true })

    const { count: memberCount } = await supabase
      .from('family_members')
      .select('*', { count: 'exact', head: true })

    const { count: recurringCount } = await supabase
      .from('recurring_assignments')
      .select('*', { count: 'exact', head: true })

    const { count: assignmentCount } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })

    console.log('✅ Simpson Board Setup Verification')
    console.log('===================================')
    console.log(`📋 Chores: ${choreCount}`)
    console.log(`👨‍👩‍👧‍👦 Family Members: ${memberCount}`)
    console.log(`🔁 Recurring Assignments: ${recurringCount}`)
    console.log(`📅 Total Assignments (30 days): ${assignmentCount}`)

    // Sample a few chores
    const { data: sampleChores } = await supabase
      .from('chores')
      .select('name, frequency')
      .limit(5)

    console.log('\n📋 Sample Chores:')
    sampleChores.forEach(c => console.log(`  - ${c.name} (${c.frequency})`))

    // Sample today's assignments
    const today = new Date().toISOString().split('T')[0]
    const { data: todayAssignments } = await supabase
      .from('assignments')
      .select(`
        due_date,
        chores (name),
        family_members (name)
      `)
      .eq('due_date', today)
      .limit(5)

    console.log(`\n📅 Sample Assignments for ${today}:`)
    todayAssignments.forEach(a => {
      console.log(`  - ${a.chores.name} → ${a.family_members.name}`)
    })
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

verify()
