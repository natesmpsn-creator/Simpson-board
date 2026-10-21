# Simpson Board - Setup Guide

## Database Setup

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Open the SQL Editor
3. Run the following SQL to create all tables:

```sql
-- Create family_members table
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create chores table
CREATE TABLE chores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  frequency TEXT DEFAULT 'daily',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chore_id UUID REFERENCES chores(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES family_members(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create calendar_events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT DEFAULT 'family',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now)
CREATE POLICY "Allow all operations on family_members" ON family_members FOR ALL USING (TRUE);
CREATE POLICY "Allow all operations on chores" ON chores FOR ALL USING (TRUE);
CREATE POLICY "Allow all operations on assignments" ON assignments FOR ALL USING (TRUE);
CREATE POLICY "Allow all operations on calendar_events" ON calendar_events FOR ALL USING (TRUE);
```

4. Click "RUN" and wait for confirmation

## Environment Variables

The `.env.local` file is already configured with your Supabase credentials.

## Running Locally

```bash
npm run dev
```

Then visit http://localhost:3000

## Deploying to Vercel

1. Push to GitHub (optional but recommended)
2. Go to https://vercel.com
3. Click "Add New" → "Project"
4. Import the GitHub repo or select "Other Git Service"
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click Deploy

## Using Simpson Board

- **Main View**: Shows chore grid (people × chores) and calendar
- **Click Edit**: Add family members, chores, and calendar events
- **Check Chores**: Click the circles to mark chores complete
- **Calendar**: Shows birthdays, family events, and church dates

Enjoy!
