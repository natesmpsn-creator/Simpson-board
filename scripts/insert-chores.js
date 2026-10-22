const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://pcmrddppvkjvtkwscyud.supabase.co'
const supabaseKey = 'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'

const supabase = createClient(supabaseUrl, supabaseKey)

const chores = [
  // Morning Daily (all kids)
  { name: 'Time with Jesus', frequency: 'daily' },
  { name: 'Make bed', frequency: 'daily' },
  { name: 'Get dressed', frequency: 'daily' },
  { name: 'Brush teeth', frequency: 'daily' },
  { name: 'Put away clothes', frequency: 'daily' },

  // Morning Rotate
  { name: 'Unload dishwasher', frequency: 'daily' },

  // Afternoon Rotate - 3 boys
  { name: 'Wipe down bathroom counter, mirror and toilet', frequency: 'every_other_day' },
  { name: 'Vacuum basement stairs', frequency: 'twice_a_week' },
  { name: 'Vacuum basement living area', frequency: 'twice_a_week' },
  { name: 'Vacuum room', frequency: 'twice_a_week' },
  { name: 'Clean shower', frequency: 'once_a_week' },
  { name: 'Clean bathroom floor and baseboards', frequency: 'once_a_week' },

  // 3-Day Rotation
  { name: 'Wipe down sink & clean mirror', frequency: 'every_3_days' },
  { name: 'Clean mirror and wipe down sink', frequency: 'every_3_days' },

  // Weekly Rotate
  { name: 'Clean toilet, shower & floor', frequency: 'once_a_week' },

  // Evening Rotate
  { name: 'Wash dinner dishes & load dishwasher', frequency: 'daily' },
  { name: 'Vacuum kitchen floor', frequency: 'daily' },
  { name: 'Clear & wipe table', frequency: 'daily' },
  { name: 'Clear & wipe counters', frequency: 'daily' },
  { name: 'Clear & wipe island', frequency: 'daily' },
  { name: 'Dry dishes', frequency: 'daily' },
  { name: 'Put away dishes', frequency: 'daily' },

  // 3-Day Rotate (Mom/Brooke)
  { name: 'Clean downstairs bathroom', frequency: 'every_3_days' },
  { name: 'Mop front area and kitchen', frequency: 'every_3_days' },
  { name: 'Vacuum stairs', frequency: 'every_3_days' },

  // Mom Weekly
  { name: 'Wipe down bathroom', frequency: 'once_a_week' },
  { name: 'Clean shower & bathroom floor', frequency: 'once_a_week' },
  { name: 'Mop living areas', frequency: 'once_a_week' },
  { name: 'Clean windows & front door', frequency: 'once_a_week' },

  // Dad Weekly
  { name: 'Straighten up garage', frequency: 'once_a_week' },
  { name: 'Take care of extra trash', frequency: 'once_a_week' },
]

async function insertChores() {
  try {
    console.log(`Inserting ${chores.length} chores...`)
    const { data, error } = await supabase
      .from('chores')
      .insert(chores)
      .select()

    if (error) {
      console.error('Error inserting chores:', error)
      process.exit(1)
    }

    console.log(`Successfully inserted ${data.length} chores`)
    console.log('Sample:', data.slice(0, 3))
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

insertChores()
