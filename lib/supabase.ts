import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseKey)

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials!')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')

export type FamilyMember = {
  id: string
  name: string
  created_at: string
}

export type Chore = {
  id: string
  name: string
  frequency: string
  created_at: string
}

export type Assignment = {
  id: string
  chore_id: string
  assigned_to: string
  due_date: string
  completed: boolean
  created_at: string
}

export type CalendarEvent = {
  id: string
  title: string
  date: string
  type: 'birthday' | 'family' | 'church'
  created_at: string
}
