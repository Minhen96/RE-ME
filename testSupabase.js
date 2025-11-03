import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("URL:", supabaseUrl)
console.log("KEY:", supabaseKey ? "✅ Loaded" : "❌ Missing")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  const { data, error } = await supabase.auth.getSession()
  if (error) console.error("❌ Supabase error:", error)
  else console.log("✅ Supabase connected! Auth service works.")
}

testConnection()
