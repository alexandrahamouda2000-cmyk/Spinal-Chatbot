-- Run once in your Supabase SQL Editor. The website uses only the server-side service key.
create table public.documents (id uuid primary key default gen_random_uuid(), title text not null, content text not null, active boolean not null default true, created_at timestamptz not null default now());
create table public.cases (id uuid primary key, question text not null, email text not null, draft text, approved text, status text not null check(status in ('awaiting_nurse','email_failed','review','approved','sent','rejected','delivery_failed')), inbound_id text, reviewed_at timestamptz, created_at timestamptz not null default now());
create table public.rate_limits (bucket text primary key, window_start timestamptz not null, hits integer not null);
alter table public.documents enable row level security;
alter table public.cases enable row level security;
alter table public.rate_limits enable row level security;
revoke all on public.documents, public.cases, public.rate_limits from anon, authenticated;
create function public.check_rate(bucket text) returns boolean language plpgsql security definer set search_path = public as $$
declare n integer;
begin
 insert into rate_limits as r values (bucket,now(),1)
 on conflict on constraint rate_limits_pkey do update set hits=case when r.window_start < now()-interval '1 hour' then 1 else r.hits+1 end, window_start=case when r.window_start < now()-interval '1 hour' then now() else r.window_start end returning hits into n;
 return n<=20;
end; $$;
revoke all on function public.check_rate(text) from public,anon,authenticated;
grant execute on function public.check_rate(text) to service_role;
-- Delete old rate-limit rows periodically: delete from rate_limits where window_start < now()-interval '2 days';
-- Approval and knowledge publication are one database transaction.
create function public.approve_case(case_id uuid,response text,reusable_text text default null) returns void language plpgsql security definer set search_path=public as $$
declare c cases;
begin
 select * into c from cases where id=case_id for update;
 if not found or c.status not in ('review','delivery_failed') then raise exception 'Case is not awaiting review'; end if;
 if c.status='delivery_failed' and response<>c.approved then raise exception 'Retry must use the original approved answer'; end if;
 update cases set approved=response,status='approved',reviewed_at=now() where id=case_id;
 if reusable_text is not null then
 insert into documents(id,title,content,active) values(case_id,'Clinician-approved general information',reusable_text,true)
 on conflict(id) do update set content=excluded.content,active=true;
 end if;
end; $$;
revoke all on function public.approve_case(uuid,text,text) from public,anon,authenticated;
grant execute on function public.approve_case(uuid,text,text) to service_role;
