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

INSERT INTO reviews (name, review_text, rating, approved)
SELECT *
FROM (
  VALUES
    (
      'Sharon W.',
      'The trip was well organized, communication was smooth, and the whole experience felt worth it from start to finish.',
      5,
      TRUE
    ),
    (
      'Brian K.',
      'I loved the flexible payment plan and how easy it was to secure my spot before clearing the balance later.',
      5,
      TRUE
    ),
    (
      'Mercy N.',
      'Friendly team, beautiful destinations, and great coordination on the day of travel. I would book again.',
      5,
      TRUE
    ),
    (
      'Dennis M.',
      'The payment process was simple and the team kept us updated before the trip.',
      4,
      FALSE
    ),
    (
      'Faith G.',
      'Pickup was well communicated and the whole adventure felt smooth and enjoyable.',
      5,
      TRUE
    ),
    (
      'Kelvin T.',
      'Nice planning, fair pricing, and a very professional travel experience overall.',
      5,
      TRUE
    )
) AS seeded_reviews(name, review_text, rating, approved)
WHERE NOT EXISTS (SELECT 1 FROM reviews);

INSERT INTO customers (name, phone, notes)
VALUES
  ('Sharon W.', '0740629899', 'Requested window seat.'),
  ('Brian K.', '0768070634', 'Confirmed for shared room.'),
  ('Mercy N.', '0711757863', 'Needs pickup reminder.'),
  ('Kelvin T.', '0798001122', 'Vegetarian meal preference.'),
  ('Faith G.', '0700123456', 'Interested in seasonal rally adventures.')
ON CONFLICT (phone) DO UPDATE
SET
  name = EXCLUDED.name,
  notes = EXCLUDED.notes,
  updated_at = NOW();

INSERT INTO bookings (
  booking_code,
  customer_id,
  package_id,
  payment_option,
  promo_code,
  original_total_amount,
  discount_amount,
  total_amount,
  amount_paid,
  balance,
  status
)
SELECT
  seeded.booking_code,
  customers.id,
  packages.id,
  seeded.payment_option,
  NULL,
  seeded.total_amount,
  0,
  seeded.total_amount,
  seeded.amount_paid,
  seeded.balance,
  seeded.status
FROM (
  VALUES
    ('BK-1001', '0740629899', 'maasai-mara-big-five-safari', 'space', 32999, 8000, 24999, 'Pending balance'),
    ('BK-1002', '0768070634', 'mount-kenya-summit-trail', 'full', 18500, 18500, 0, 'Confirmed'),
    ('BK-1003', '0711757863', 'mombasa-malindi-summer-tides', 'space', 21999, 11000, 10999, 'Pending balance'),
    ('BK-1004', '0798001122', 'mt-satima-sunrise-hike', 'full', 4500, 4500, 0, 'Confirmed'),
    ('BK-1005', '0700123456', 'wrc-naivasha-experience', 'space', 3800, 2000, 1800, 'Awaiting payment')
) AS seeded(booking_code, customer_phone, package_slug, payment_option, total_amount, amount_paid, balance, status)
JOIN customers ON customers.phone = seeded.customer_phone
JOIN packages ON packages.slug = seeded.package_slug
ON CONFLICT (booking_code) DO UPDATE
SET
  customer_id = EXCLUDED.customer_id,
  package_id = EXCLUDED.package_id,
  payment_option = EXCLUDED.payment_option,
  total_amount = EXCLUDED.total_amount,
  amount_paid = EXCLUDED.amount_paid,
  balance = EXCLUDED.balance,
  status = EXCLUDED.status,
  updated_at = NOW();

INSERT INTO payments (
  payment_code,
  booking_id,
  phone,
  promo_code,
  original_total_amount,
  discounted_total_amount,
  discount_amount,
  amount,
  reference,
  stk_status,
  response_description
)
SELECT
  seeded.payment_code,
  bookings.id,
  seeded.phone,
  NULL,
  bookings.total_amount,
  bookings.total_amount,
  0,
  seeded.amount,
  seeded.reference,
  seeded.stk_status,
  seeded.response_description
FROM (
  VALUES
    ('PAY-2001', 'BK-1001', '0740629899', 8000, 'MARA8000', 'Success', 'Seeded successful payment'),
    ('PAY-2002', 'BK-1002', '0768070634', 18500, 'KENYA18500', 'Success', 'Seeded successful payment'),
    ('PAY-2003', 'BK-1003', '0711757863', 11000, 'MOMB11000', 'Pending', 'STK push sent and awaiting confirmation'),
    ('PAY-2004', 'BK-1004', '0798001122', 4500, 'SAT4500', 'Success', 'Seeded successful payment'),
    ('PAY-2005', 'BK-1005', '0700123456', 2000, 'WRC2000', 'Failed', 'Customer did not complete the PIN prompt')
) AS seeded(payment_code, booking_code, phone, amount, reference, stk_status, response_description)
JOIN bookings ON bookings.booking_code = seeded.booking_code
ON CONFLICT (payment_code) DO UPDATE
SET
  booking_id = EXCLUDED.booking_id,
  phone = EXCLUDED.phone,
  amount = EXCLUDED.amount,
  reference = EXCLUDED.reference,
  stk_status = EXCLUDED.stk_status,
  response_description = EXCLUDED.response_description,
  updated_at = NOW();

INSERT INTO assistant_messages (source, topic, summary, unanswered)
SELECT *
FROM (
  VALUES
    ('Website AI', 'Booking info', 'Asked for dates and deposit details for Maasai Mara.', FALSE),
    ('Website AI', 'Upcoming events', 'Wanted to know which adventures are coming up next.', FALSE),
    ('WhatsApp', 'Pickup point', 'Customer asked for Nairobi meeting point confirmation.', TRUE),
    ('Website AI', 'Payment issue', 'Customer said STK push did not reach the phone.', TRUE),
    ('Instagram', 'Destination suggestion', 'Suggested adding Nanyuki or Samburu next.', FALSE)
) AS seeded_messages(source, topic, summary, unanswered)
WHERE NOT EXISTS (SELECT 1 FROM assistant_messages);

INSERT INTO gallery_items (src, location, visible, sort_order)
SELECT *
FROM (
  VALUES
    ('/assets/image_1.png', 'Mombasa', TRUE, 1),
    ('/assets/image_3.png', 'Naivasha', TRUE, 2),
    ('/assets/image_0.png', 'Maasai Mara', TRUE, 3),
    ('/assets/image_2.jpg', 'Mount Kenya', TRUE, 4),
    ('/assets/image_4.jpg', 'Mt. Satima', TRUE, 5),
    ('/assets/image_5.jpg', 'Maasai Mara', FALSE, 6)
) AS seeded_gallery(src, location, visible, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM gallery_items);

INSERT INTO announcements (title, status, body)
SELECT *
FROM (
  VALUES
    ('Maasai Mara Seats Filling Fast', 'Active', 'Only a few safari seats are left for the July departure.'),
    ('Mt. Satima Sunrise Special', 'Draft', 'Early bird spot offer for the next hike.')
) AS seeded_announcements(title, status, body)
WHERE NOT EXISTS (SELECT 1 FROM announcements);

INSERT INTO promo_codes (code, discount, status)
SELECT *
FROM (
  VALUES
    ('MARA10', '10%', 'Active'),
    ('WEEKEND5', 'KES 500', 'Paused')
) AS seeded_promos(code, discount, status)
WHERE NOT EXISTS (SELECT 1 FROM promo_codes);

INSERT INTO site_content (
  id,
  about_text,
  contact_phones,
  footer_email,
  payment_instructions,
  footer_links
)
VALUES (
  1,
  'Platinum Vacations is based in Nyeri and specializes in carefully planned travel adventures across Kenya.',
  '0740629899, 0768070634, 0711757863',
  'platinumvacationske@gmail.com',
  'Customers can pay in full or reserve a space with at least half upfront and clear the balance the day before the trip.',
  'Instagram, TikTok, WhatsApp'
)
ON CONFLICT (id) DO UPDATE
SET
  about_text = EXCLUDED.about_text,
  contact_phones = EXCLUDED.contact_phones,
  footer_email = EXCLUDED.footer_email,
  payment_instructions = EXCLUDED.payment_instructions,
  footer_links = EXCLUDED.footer_links,
  updated_at = NOW();
