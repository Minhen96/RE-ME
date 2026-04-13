import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("URL:", supabaseUrl)
console.log("KEY:", supabaseKey ? "✅ Loaded" : "❌ Missing")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'reme_app'
  }
})

async function testConnection() {
  console.log("Testing connection and schema access...")
  
  // 1. Check Auth service
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError) {
    console.error("❌ Auth service error:", authError)
  } else {
    console.log("✅ Auth service works.")
  }

  // 2. Check Data service (Schema access)
  const { data, error: dbError } = await supabase
    .from('profiles')
    .select('count')
    .limit(1)

  if (dbError) {
    console.error("❌ Database schema error:", dbError)
    console.log("💡 Tip: Make sure you added 'reme_app' to 'Exposed Schemas' in Supabase Settings -> API.")
  } else {
    console.log("✅ Database schema 'reme_app' is accessible and profiles table was found.")
  }
}

testConnection()
