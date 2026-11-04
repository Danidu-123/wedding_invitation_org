import { createClient } from "@supabase/supabase-js";

/** Session-less server client for the two public RPCs (get_invite, submit_rsvp). */
export function supabasePublic() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type Invite = { name: string; invited_count: number; rsvp: string; attendees: number | null };

export async function getInvite(code: string): Promise<Invite | null> {
  if (!/^[a-z0-9]{6,32}$/i.test(code)) return null;
  try {
    const { data, error } = await supabasePublic().rpc("get_invite", { p_code: code });
    if (error || !data?.length) return null;
    return data[0] as Invite;
  } catch {
    return null;
  }
}
