import { NextResponse } from "next/server";
import { z } from "zod";
import { supabasePublic } from "@/lib/supabase/public";

const Body = z.object({
  code: z.string().trim().max(32).nullable().optional(),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(9).max(20),
  status: z.enum(["accepted", "maybe", "declined"]),
  attendees: z.number().int().min(0).max(10),
  message: z.string().max(500).optional().default(""),
  website: z.string().optional(), // honeypot
});

const ERRORS: Record<string, [number, string]> = {
  RSVP_CLOSED: [410, "Online RSVP closed on 20 November 2026. Please contact Thinidu or Chenaji directly."],
  INVALID_PHONE: [400, "Please enter a valid phone number."],
  INVALID_NAME: [400, "Please enter your name."],
  INVALID_ATTENDEES: [400, "Please choose between 1 and 10 guests."],
  INVALID_STATUS: [400, "Please choose a response."],
};

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });
  }
  // Bots fill hidden fields; pretend success so they don't retry.
  if (body.website) return NextResponse.json({ ok: true });

  const { error } = await supabasePublic().rpc("submit_rsvp", {
    p_code: body.code || null,
    p_name: body.name,
    p_phone: body.phone,
    p_status: body.status,
    p_attendees: body.status === "declined" ? 0 : Math.max(1, body.attendees),
    p_message: body.message,
  });

  if (error) {
    const known = Object.keys(ERRORS).find((k) => error.message.includes(k));
    if (known) {
      const [status, msg] = ERRORS[known];
      return NextResponse.json({ error: msg }, { status });
    }
    console.error("submit_rsvp failed", error);
    return NextResponse.json({ error: "We couldn't save your response. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
