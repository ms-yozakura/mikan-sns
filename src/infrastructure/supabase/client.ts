import { createBrowserClient } from "@supabase/ssr";
//import {Database} from "@/types/database"
//どっかの段階でClientの型を生成する必要

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
