const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://pcmrddppvkjvtkwscyud.supabase.co'
const supabaseKey = 'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'

const supabase = createClient(supabaseUrl, supabaseKey)

// First, get all family members and chores
async function setupRecurring() {
  try {
    // Fetch all data
    const { data: members, error: membersError } = await supabase
      .from('family_members')
      .select('*')

    const { data: chores, error: choresError } = await supabase
      .from('chores')
      .select('*')

    if (membersError || choresError) {
      console.error('Error fetching data:', membersError || choresError)
      process.exit(1)
    }

    // Create maps for easy lookup
    const memberMap = {}
    const choreMap = {}

    members.forEach(m => {
      memberMap[m.name] = m.id
    })

    chores.forEach(c => {
      choreMap[c.name] = c.id
    })

    console.log('Found members:', Object.keys(memberMap))
    console.log('\nSetting up recurring assignments...')

    // Define the rotation assignments
    // Format: { choreName, assignees: ['name1', 'name2', ...], frequency }
    const assignments = [
      // Morning Daily (all kids)
      { choreName: 'Time with Jesus', assignees: ['Brooke', 'Joe', 'Nae', 'Nick', 'Bella', 'Cammi'], frequency: 'daily' },
      { choreName: 'Make bed', assignees: ['Brooke', 'Joe', 'Nae', 'Nick', 'Bella', 'Cammi'], frequency: 'daily' },
      { choreName: 'Get dressed', assignees: ['Brooke', 'Joe', 'Nae', 'Nick', 'Bella', 'Cammi'], frequency: 'daily' },
      { choreName: 'Brush teeth', assignees: ['Brooke', 'Joe', 'Nae', 'Nick', 'Bella', 'Cammi'], frequency: 'daily' },
      { choreName: 'Put away clothes', assignees: ['Brooke', 'Joe', 'Nae', 'Nick', 'Bella', 'Cammi'], frequency: 'daily' },

      // Morning Rotate (Nick, Bella, Cammi)
      { choreName: 'Unload dishwasher', assignees: ['Nick', 'Bella', 'Cammi'], frequency: 'daily' },

      // Afternoon Rotate - 3 boys (Joe, Nae, Nick)
      { choreName: 'Wipe down bathroom counter, mirror and toilet', assignees: ['Joe', 'Nae', 'Nick'], frequency: 'every_other_day' },
      { choreName: 'Vacuum basement stairs', assignees: ['Joe', 'Nae', 'Nick'], frequency: 'twice_a_week' },
      { choreName: 'Vacuum basement living area', assignees: ['Joe', 'Nae', 'Nick'], frequency: 'twice_a_week' },
      { choreName: 'Vacuum room', assignees: ['Joe', 'Nae', 'Nick'], frequency: 'twice_a_week' },
      { choreName: 'Clean shower', assignees: ['Joe', 'Nae', 'Nick'], frequency: 'once_a_week' },
      { choreName: 'Clean bathroom floor and baseboards', assignees: ['Joe', 'Nae', 'Nick'], frequency: 'once_a_week' },

      // 3-Day Rotation
      { choreName: 'Wipe down sink & clean mirror', assignees: ['Brooke'], frequency: 'every_3_days' },
      { choreName: 'Clean mirror and wipe down sink', assignees: ['Bella', 'Cammi'], frequency: 'every_3_days' },

      // Weekly Rotate (Brooke, Bella)
      { choreName: 'Clean toilet, shower & floor', assignees: ['Brooke', 'Bella'], frequency: 'once_a_week' },

      // Evening Rotate
      { choreName: 'Wash dinner dishes & load dishwasher', assignees: ['Brooke', 'Joe', 'Nae'], frequency: 'daily' },
      { choreName: 'Vacuum kitchen floor', assignees: ['Nick', 'Bella'], frequency: 'daily' },
      { choreName: 'Clear & wipe table', assignees: ['Nick', 'Bella'], frequency: 'daily' },
      { choreName: 'Clear & wipe counters', assignees: ['Brooke', 'Joe', 'Nae'], frequency: 'daily' },
      { choreName: 'Clear & wipe island', assignees: ['Brooke', 'Joe', 'Nae'], frequency: 'daily' },
      { choreName: 'Dry dishes', assignees: ['Brooke', 'Joe', 'Nae'], frequency: 'daily' },
      { choreName: 'Put away dishes', assignees: ['Brooke', 'Joe', 'Nae'], frequency: 'daily' },

      // 3-Day Rotate (Mom/Brooke)
      { choreName: 'Clean downstairs bathroom', assignees: ['Mom', 'Brooke'], frequency: 'every_3_days' },
      { choreName: 'Mop front area and kitchen', assignees: ['Mom', 'Brooke'], frequency: 'every_3_days' },
      { choreName: 'Vacuum stairs', assignees: ['Mom', 'Brooke'], frequency: 'every_3_days' },

      // Mom Weekly
      { choreName: 'Wipe down bathroom', assignees: ['Mom'], frequency: 'once_a_week' },
      { choreName: 'Clean shower & bathroom floor', assignees: ['Mom'], frequency: 'once_a_week' },
      { choreName: 'Mop living areas', assignees: ['Mom'], frequency: 'once_a_week' },
      { choreName: 'Clean windows & front door', assignees: ['Mom'], frequency: 'once_a_week' },

      // Dad Weekly
      { choreName: 'Straighten up garage', assignees: ['Dad'], frequency: 'once_a_week' },
      { choreName: 'Take care of extra trash', assignees: ['Dad'], frequency: 'once_a_week' },
    ]

    // Get today's date as start date
    const today = new Date().toISOString().split('T')[0]

    // Create recurring assignments for each combination
    const recurringToInsert = []

    for (const assignment of assignments) {
      const choreId = choreMap[assignment.choreName]
      if (!choreId) {
        console.warn(`⚠️  Chore not found: ${assignment.choreName}`)
        continue
      }

      for (const memberName of assignment.assignees) {
        const memberId = memberMap[memberName]
        if (!memberId) {
          console.warn(`⚠️  Member not found: ${memberName}`)
          continue
        }

        recurringToInsert.push({
          chore_id: choreId,
          assigned_to: memberId,
          frequency: assignment.frequency,
          start_date: today,
        })
      }
    }

    console.log(`\nInserting ${recurringToInsert.length} recurring assignments...`)
    const { data: inserted, error: insertError } = await supabase
      .from('recurring_assignments')
      .insert(recurringToInsert)
      .select()

    if (insertError) {
      console.error('Error inserting recurring assignments:', insertError)
      process.exit(1)
    }

    console.log(`✅ Successfully created ${inserted.length} recurring assignments`)
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

setupRecurring()
