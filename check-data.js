const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://pcmrddppvkjvtkwscyud.supabase.co',
  'sb_publishable_7gmeEjlip2RTw3iKQBTa2g_3upHfESX'
)

async function check() {
  const { data: chores, error: choreError } = await supabase
    .from('chores')
    .select('id, name', { count: 'exact' })
    .limit(5)

  console.log('Chores:', chores)
  console.log('Error:', choreError)
  
  const today = new Date().toISOString().split('T')[0]
  const { data: assignments, error: assignError } = await supabase
    .from('assignments')
    .select('id, due_date', { count: 'exact' })
    .eq('due_date', today)
    .limit(5)

  console.log('Assignments for today:', assignments)
  console.log('Error:', assignError)
}

check()
