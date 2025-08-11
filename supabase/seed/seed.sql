-- Seed decks
insert into public.decks (title, subject, topic, description)
values
  ('Chemistry – Acids & Bases', 'Chemistry', 'Acids & Bases', 'Key concepts for acids and bases'),
  ('Math – Trigonometry', 'Math', 'Trigonometry', 'Core trig identities and problems');

-- Get deck ids
with d as (
  select id, title from public.decks where title in ('Chemistry – Acids & Bases', 'Math – Trigonometry')
)
insert into public.cards (deck_id, front, back, hint, tags)
select id,
  case when title like 'Chemistry%' then 'Define pH' else 'sin(30°) = ?' end as front,
  case when title like 'Chemistry%' then 'pH = -log10[H+]' else '0.5' end as back,
  null as hint,
  array['mvp']
from d
union all
select id,
  case when title like 'Chemistry%' then 'Strong vs weak acid' else 'Pythagorean identity' end,
  case when title like 'Chemistry%' then 'Strong acids fully dissociate; weak acids partially' else 'sin^2θ + cos^2θ = 1' end,
  null,
  array['mvp']
from d
union all
select id,
  case when title like 'Chemistry%' then 'Neutralization reaction' else 'tan(45°) = ?' end,
  case when title like 'Chemistry%' then 'Acid + base -> salt + water' else '1' end,
  null,
  array['mvp']
from d
union all
select id,
  case when title like 'Chemistry%' then 'Define base' else 'cos(60°) = ?' end,
  case when title like 'Chemistry%' then 'Proton acceptor (Bronsted–Lowry)' else '0.5' end,
  null,
  array['mvp']
from d
union all
select id,
  case when title like 'Chemistry%' then 'Conjugate acid-base pair' else 'sin(0°) = ?' end,
  case when title like 'Chemistry%' then 'Differ by one H+' else '0' end,
  null,
  array['mvp']
from d
union all
select id,
  case when title like 'Chemistry%' then 'Indicator for strong acid/base titration' else 'cos(0°) = ?' end,
  case when title like 'Chemistry%' then 'Phenolphthalein or Methyl orange (context dependent)' else '1' end,
  null,
  array['mvp']
from d
union all
select id,
  case when title like 'Chemistry%' then 'Kw at 25°C' else 'tan(0°) = ?' end,
  case when title like 'Chemistry%' then '1.0×10^-14' else '0' end,
  null,
  array['mvp']
from d
union all
select id,
  case when title like 'Chemistry%' then 'pOH definition' else 'sin(90°) = ?' end,
  case when title like 'Chemistry%' then 'pOH = -log10[OH-]' else '1' end,
  null,
  array['mvp']
from d
union all
select id,
  case when title like 'Chemistry%' then 'Buffer solution' else 'cos(90°) = ?' end,
  case when title like 'Chemistry%' then 'Resists pH change on small acid/base addition' else '0' end,
  null,
  array['mvp']
from d
union all
select id,
  case when title like 'Chemistry%' then 'Acid dissociation constant (Ka)' else 'tan(30°) = ?' end,
  case when title like 'Chemistry%' then '[H+][A-]/[HA]' else '1/√3 ≈ 0.577' end,
  'Use surd or decimal',
  array['mvp']
from d
union all
select id,
  case when title like 'Chemistry%' then 'Relationship between pH and [H+]' else 'tan(60°) = ?' end,
  case when title like 'Chemistry%' then '[H+] = 10^-pH' else '√3 ≈ 1.732' end,
  'Use surd or decimal',
  array['mvp']
from d
union all
select id,
  case when title like 'Chemistry%' then 'Monoprotic vs diprotic acid' else 'SOHCAHTOA meaning' end,
  case when title like 'Chemistry%' then 'Monoprotic donates 1 H+, diprotic 2 H+' else 'Mnemonic for trig ratios' end,
  null,
  array['mvp']
from d
union all
select id,
  case when title like 'Chemistry%' then 'Common strong acids' else 'sin(A±B) identity' end,
  case when title like 'Chemistry%' then 'HCl, HNO3, H2SO4 (first dissociation)' else 'sinA cosB ± cosA sinB' end,
  null,
  array['mvp']
from d
union all
select id,
  case when title like 'Chemistry%' then 'Common strong bases' else 'cos(A±B) identity' end,
  case when title like 'Chemistry%' then 'NaOH, KOH' else 'cosA cosB ∓ sinA sinB' end,
  null,
  array['mvp']
from d;


