alter table public.profile_views
  add column if not exists is_bot boolean not null default false,
  add column if not exists bot_reason text;

alter table public.profile_clicks
  add column if not exists is_bot boolean not null default false,
  add column if not exists bot_reason text;

update public.profile_views
set
  is_bot = true,
  bot_reason = 'known_bot_user_agent'
where user_agent is not null
  and lower(user_agent) ~ '(bot|crawler|spider|slurp|scrapy|curl|wget|python-requests|python/|postmanruntime|insomnia|go-http-client|phantomjs|headlesschrome|selenium|puppeteer|playwright|lighthouse|pagespeed|facebookexternalhit|facebot|twitterbot|linkedinbot|pinterestbot|slackbot|discordbot|telegrambot|skypeuripreview|google-inspectiontool|bingpreview|gptbot|chatgpt-user|claudebot|perplexitybot)';

update public.profile_clicks
set
  is_bot = true,
  bot_reason = 'known_bot_user_agent'
where user_agent is not null
  and lower(user_agent) ~ '(bot|crawler|spider|slurp|scrapy|curl|wget|python-requests|python/|postmanruntime|insomnia|go-http-client|phantomjs|headlesschrome|selenium|puppeteer|playwright|lighthouse|pagespeed|facebookexternalhit|facebot|twitterbot|linkedinbot|pinterestbot|slackbot|discordbot|telegrambot|skypeuripreview|google-inspectiontool|bingpreview|gptbot|chatgpt-user|claudebot|perplexitybot)';

create index if not exists profile_views_human_public_id_viewed_at_idx
  on public.profile_views (public_id, viewed_at desc)
  where is_bot = false;

create index if not exists profile_clicks_human_public_id_clicked_at_idx
  on public.profile_clicks (public_id, clicked_at desc)
  where is_bot = false;

create table if not exists public.analytics_rate_limits (
  fingerprint text not null,
  event_kind text not null check (event_kind in ('view', 'click')),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1 check (request_count > 0),
  primary key (fingerprint, event_kind)
);

alter table public.analytics_rate_limits enable row level security;

create or replace function public.consume_analytics_rate_limit(
  p_fingerprint text,
  p_event_kind text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  if length(p_fingerprint) < 32
    or p_event_kind not in ('view', 'click')
    or p_limit < 1
    or p_window_seconds < 1 then
    return false;
  end if;

  insert into public.analytics_rate_limits (
    fingerprint,
    event_kind,
    window_started_at,
    request_count
  )
  values (p_fingerprint, p_event_kind, now(), 1)
  on conflict (fingerprint, event_kind) do update
  set
    request_count = case
      when analytics_rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        then 1
      else analytics_rate_limits.request_count + 1
    end,
    window_started_at = case
      when analytics_rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        then now()
      else analytics_rate_limits.window_started_at
    end
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on table public.analytics_rate_limits from anon, authenticated;
revoke all on function public.consume_analytics_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_analytics_rate_limit(text, text, integer, integer) to service_role;
