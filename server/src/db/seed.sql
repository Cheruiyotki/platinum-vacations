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
    'Mombasa (Malindi) Summer Tides Adventure',
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
    'mount-kenya-summit-trail',
    'Mount Kenya Summit Trail Adventure',
    'KES 18,500',
    '12th - 14th June',
    '3 DAYS 2 NIGHTS',
    'Weekend Escape',
    'A scenic mountain hike with expert guides and full camp support.',
    '[
      "Transport from Nairobi and back",
      "2 Nights mountain camp accommodation",
      "Park entry fees",
      "Professional mountain guide",
      "Chef-prepared meals on the mountain"
    ]'::jsonb,
    '[
      "Personal hiking gear",
      "Travel insurance",
      "Additional snacks and drinks"
    ]'::jsonb,
    'Nairobi CBD, Archives Stage',
    'Ideal for adventurous beginners with moderate fitness.',
    '/assets/image_2.jpg',
    6000
  ),
  (
    'mt-satima-sunrise-hike',
    'Mt. Satima Sunrise Hike Adventure',
    'KES 4,500',
    '28th June',
    '1 DAY ADVENTURE',
    'Sunrise Special',
    'Catch the sunrise from the highest peak in the Aberdares with an early morning group departure.',
    '[
      "Round-trip transport",
      "Guided hike experience",
      "Packed breakfast",
      "Professional photography moments",
      "Mineral water"
    ]'::jsonb,
    '[
      "Lunch",
      "Personal hiking equipment",
      "Any private expenses"
    ]'::jsonb,
    'Kencom, Nairobi',
    'Warm layers are recommended for the early morning ascent.',
    '/assets/image_4.jpg',
    1500
  ),
  (
    'maasai-mara-big-five-safari',
    'Maasai Mara Big Five Safari Adventure',
    'KES 32,999',
    '18th - 20th July',
    '3 DAYS 2 NIGHTS',
    'Safari Favorite',
    'Experience game drives, dramatic savannah views, and unforgettable wildlife encounters.',
    '[
      "Return transport in a safari van",
      "2 Nights accommodation",
      "Meals on full board basis",
      "Game drives in Maasai Mara",
      "Driver guide services"
    ]'::jsonb,
    '[
      "Maasai village visit fee",
      "Drinks and personal items",
      "Travel insurance"
    ]'::jsonb,
    'Nairobi CBD, Archives Stage',
    'Perfect for travelers who want a classic Kenyan safari experience.',
    '/assets/image_5.jpg',
    8000
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
