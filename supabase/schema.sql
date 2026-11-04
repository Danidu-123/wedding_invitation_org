-- Already applied to Supabase project cqtjxwbommgzqwuescuq (thinidu-chenaji-wedding).
-- Kept here for reference / re-creating the database.
create type public.rsvp_status as enum ('pending','accepted','maybe','declined');

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  phone text check (phone is null or phone ~ '^[0-9]{9,15}$'),
  invite_code text not null unique default lower(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  invited_count int not null default 2 check (invited_count between 1 and 20),
  invitation_sent boolean not null default false,
  invitation_sent_at timestamptz,
  rsvp public.rsvp_status not null default 'pending',
  attendees int check (attendees between 0 and 20),
  message text check (message is null or char_length(message) <= 500),
  notes text check (notes is null or char_length(notes) <= 1000),
  source text not null default 'admin' check (source in ('admin','self')),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index guests_phone_key on public.guests(phone) where phone is not null;
create index guests_rsvp_idx on public.guests(rsvp);
create table public.admin_emails (email text primary key check (email = lower(email)));

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
create trigger guests_updated_at before update on public.guests for each row execute function public.set_updated_at();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_emails a where a.email = lower(coalesce(auth.jwt() ->> 'email','')));
$$;

alter table public.guests enable row level security;
alter table public.admin_emails enable row level security;
create policy "admins manage guests" on public.guests for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins read admin list" on public.admin_emails for select to authenticated using ((select public.is_admin()));

create or replace function public.normalize_phone(p text) returns text language plpgsql immutable set search_path = '' as $$
declare d text := regexp_replace(coalesce(p,''), '\D', '', 'g');
begin
  if d = '' then return null; end if;
  if left(d,2) = '00' then d := substr(d,3); end if;
  if length(d) = 10 and left(d,1) = '0' then d := '94' || substr(d,2);
  elsif length(d) = 9 then d := '94' || d; end if;
  if d !~ '^[0-9]{9,15}$' then raise exception 'INVALID_PHONE'; end if;
  return d;
end; $$;

create or replace function public.get_invite(p_code text)
returns table(name text, invited_count int, rsvp public.rsvp_status, attendees int)
language sql stable security definer set search_path = '' as $$
  select g.name, g.invited_count, g.rsvp, g.attendees from public.guests g where g.invite_code = lower(btrim(p_code)) limit 1;
$$;

-- RSVP deadline is enforced here: 20 Nov 2026 23:59:59 Sri Lanka time
create or replace function public.submit_rsvp(p_code text, p_name text, p_phone text, p_status text, p_attendees int, p_message text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_deadline constant timestamptz := '2026-11-20 23:59:59+05:30';
  v_status public.rsvp_status; v_name text := btrim(coalesce(p_name,'')); v_phone text; v_att int;
  v_msg text := nullif(btrim(coalesce(p_message,'')),''); v_id uuid;
begin
  if now() > v_deadline then raise exception 'RSVP_CLOSED'; end if;
  if p_status not in ('accepted','maybe','declined') then raise exception 'INVALID_STATUS'; end if;
  v_status := p_status::public.rsvp_status;
  if char_length(v_name) < 2 or char_length(v_name) > 120 then raise exception 'INVALID_NAME'; end if;
  v_phone := public.normalize_phone(p_phone);
  if v_phone is null then raise exception 'INVALID_PHONE'; end if;
  if v_msg is not null and char_length(v_msg) > 500 then v_msg := left(v_msg, 500); end if;
  if v_status = 'declined' then v_att := 0;
  else v_att := coalesce(p_attendees, 1); if v_att < 1 or v_att > 10 then raise exception 'INVALID_ATTENDEES'; end if; end if;
  if nullif(btrim(coalesce(p_code,'')),'') is not null then select id into v_id from public.guests where invite_code = lower(btrim(p_code)); end if;
  if v_id is null then select id into v_id from public.guests where phone = v_phone; end if;
  if v_id is not null then
    update public.guests set rsvp = v_status, attendees = v_att, message = v_msg, responded_at = now(),
      phone = coalesce(phone, case when not exists (select 1 from public.guests x where x.phone = v_phone and x.id <> v_id) then v_phone end)
    where id = v_id;
  else
    insert into public.guests(name, phone, rsvp, attendees, message, source, responded_at, invited_count)
    values (v_name, v_phone, v_status, v_att, v_msg, 'self', now(), greatest(v_att,1));
  end if;
  return v_name;
end; $$;

revoke all on function public.get_invite(text), public.submit_rsvp(text,text,text,text,int,text), public.is_admin(), public.normalize_phone(text) from public;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.normalize_phone(text) from anon, authenticated;
revoke execute on function public.set_updated_at() from anon, authenticated;
grant execute on function public.get_invite(text) to anon, authenticated;
grant execute on function public.submit_rsvp(text,text,text,text,int,text) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;

alter publication supabase_realtime add table public.guests;

-- Who may use /admin (must also exist as a Supabase Auth user)
insert into public.admin_emails(email) values ('atdeshan@gmail.com');
