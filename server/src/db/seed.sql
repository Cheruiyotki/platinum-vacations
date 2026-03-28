INSERT INTO packages (
  slug,
  title,
  cost,
  dates,
  duration_banner,
  date_pill,
  description,
  includes_json,
  excludes_json,
  pickup_point,
  note,
  image_url,
  deposit_required
)
VALUES
  (
    'mombasa-malindi-summer-tides',
    'Mombasa (Malindi) Summer Tides Package',
    'KES 21,999',
    '2nd - 5th July',
    '4 DAYS 3 NIGHTS',
    NULL,
    'Per Person Sharing',
    '[
      "To and Fro Economical SGR Tickets",
      "3 Nights accommodation",
      "Meals on Half Board Basis (HB)",
      "SGR Transfers to Hotel",
      "Free Unlimited Photography"
    ]'::jsonb,
    '[
      "Summer Tides Tickets",
      "Lunch and Drinks",
      "CBD Transfers to SGR Terminal",
      "Transfers from Hotel to Beach and Summer Tides Venue"
    ]'::jsonb,
    NULL,
    'HB = Breakfast and Supper.',
    '/assets/image_1.png',
    5000
  ),
  (
    'wrc-naivasha-experience',
    'WRC (World Rally Championship) Naivasha Experience',
    'KES 3,800 ONLY',
    'Sat 14th - Sun 15th March',
    NULL,
    'Sat 14th - Sun 15th March',
    'Book a seat with KES 1,000. Balance to be completed in Lipa Mdogo Mdogo.',
    '[
      "Transport TO & FRO",
      "Scenic Rally View",
      "Unlimited Photography",
      "Mineral Water",
      "Lake Naivasha Stopover",
      "Team Building",
      "2 Days of Unlimited Fun"
    ]'::jsonb,
    '[
      "Food & Drinks",
      "Boat Riding at L. Naivasha"
    ]'::jsonb,
    'Nairobi CBD, Jeevanjee Gardens',
    NULL,
    '/assets/image_3.png',
    1000
  )
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  cost = EXCLUDED.cost,
  dates = EXCLUDED.dates,
  duration_banner = EXCLUDED.duration_banner,
  date_pill = EXCLUDED.date_pill,
  description = EXCLUDED.description,
  includes_json = EXCLUDED.includes_json,
  excludes_json = EXCLUDED.excludes_json,
  pickup_point = EXCLUDED.pickup_point,
  note = EXCLUDED.note,
  image_url = EXCLUDED.image_url,
  deposit_required = EXCLUDED.deposit_required,
  updated_at = NOW();
