import type { SupabaseClient, Session, User } from '@supabase/supabase-js'
import type { Database } from '$lib/types/database.types'

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>
      safeGetSession: () => Promise<{ session: Session | null; user: User | null }>
      session: Session | null
      user: User | null
    }
    interface PageData {
      session: Session | null
      user: User | null
      supabase?: SupabaseClient<Database>
    }
    // interface Error {}
    // interface Platform {}
  }
}

export {}