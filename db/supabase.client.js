import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_KEY } = process.env

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in .env')
}

// Create a single supabase client for authentication
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default supabase
