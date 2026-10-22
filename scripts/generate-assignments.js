const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://pcmrddppvkjvtkwscyud.supabase.co'
const supabaseKey = 'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'

const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to generate assignments from recurring rules
function generateAssignmentsFromRecurring(recRule) {
  const startDate = new Date(recRule.start_date)
  const assignments = []

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + i)
    const dayOfWeek = currentDate.getDay()

    let shouldAssign = false

    if (recRule.frequency === 'daily') {
      shouldAssign = true
    } else if (recRule.frequency === 'every_other_day') {
      shouldAssign = i % 2 === 0
    } else if (recRule.frequency === 'weekday') {
      shouldAssign = dayOfWeek > 0 && dayOfWeek < 6
    } else if (recRule.frequency === 'weekend') {
      shouldAssign = dayOfWeek === 0 || dayOfWeek === 6
    } else if (recRule.frequency === 'every_3_days') {
      shouldAssign = i % 3 === 0
    } else if (recRule.frequency === 'twice_a_week') {
      shouldAssign = dayOfWeek === 1 || dayOfWeek === 4
    } else if (recRule.frequency === 'once_a_week') {
      shouldAssign = dayOfWeek === 1
    }

    if (shouldAssign) {
      const dateStr = currentDate.toISOString().split('T')[0]
      assignments.push({
        chore_id: recRule.chore_id,
        assigned_to: recRule.assigned_to,
        due_date: dateStr,
        completed: false,
      })
    }
  }

  return assignments
}

async function generateAssignments() {
  try {
    // Get all recurring assignments
    const { data: recurringRules, error: fetchError } = await supabase
      .from('recurring_assignments')
      .select('*')

    if (fetchError) {
      console.error('Error fetching recurring rules:', fetchError)
      process.exit(1)
    }

    console.log(`Found ${recurringRules.length} recurring rules`)

    // Generate assignments for each rule
    let allAssignments = []
    for (const rule of recurringRules) {
      const generated = generateAssignmentsFromRecurring(rule)
      allAssignments = allAssignments.concat(generated)
    }

    console.log(`Generated ${allAssignments.length} assignments`)

    // Insert all assignments
    const { data: inserted, error: insertError } = await supabase
      .from('assignments')
      .insert(allAssignments)
      .select()

    if (insertError) {
      console.error('Error inserting assignments:', insertError)
      process.exit(1)
    }

    console.log(`✅ Successfully inserted ${inserted.length} assignments for the next 30 days`)
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

generateAssignments()
