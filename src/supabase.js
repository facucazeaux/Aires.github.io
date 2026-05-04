import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://stbfyyayplsnzlqjyvyp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YmZ5eWF5cGxzbnpscWp5dnlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzM3NDAsImV4cCI6MjA5MjQ0OTc0MH0.53IodiGaHfXundUdmS2o88-FGYxmBR6mYKWb2ofeuO4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
