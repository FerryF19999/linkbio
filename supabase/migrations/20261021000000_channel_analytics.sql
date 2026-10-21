alter table public.profile_views
  add column if not exists source_channel text;

alter table public.profile_clicks
  add column if not exists source_channel text;

create index if not exists profile_views_public_id_source_channel_idx
  on public.profile_views (public_id, source_channel);

create index if not exists profile_clicks_public_id_source_channel_idx
  on public.profile_clicks (public_id, source_channel);

update public.profile_views
set source_channel = case
  when lower(coalesce(referrer, '')) like '%instagram.com%' then 'instagram'
  when lower(coalesce(referrer, '')) like '%tiktok.com%' then 'tiktok'
  when lower(coalesce(referrer, '')) like '%youtube.com%' or lower(coalesce(referrer, '')) like '%youtu.be%' then 'youtube'
  when lower(coalesce(referrer, '')) like '%facebook.com%' or lower(coalesce(referrer, '')) like '%fb.com%' then 'facebook'
  when lower(coalesce(referrer, '')) like '%twitter.com%' or lower(coalesce(referrer, '')) like '%t.co%' or lower(coalesce(referrer, '')) like '%x.com%' then 'x'
  when lower(coalesce(referrer, '')) like '%threads.com%' or lower(coalesce(referrer, '')) like '%threads.net%' then 'threads'
  when coalesce(referrer, '') = '' then 'direct'
  else 'other'
end
where source_channel is null;

update public.profile_clicks as clicks
set source_channel = coalesce(views.source_channel, 'direct')
from public.profile_views as views
where clicks.public_id = views.public_id
  and clicks.session_id = views.session_id
  and clicks.source_channel is null;

update public.profile_clicks
set source_channel = 'direct'
where source_channel is null;
