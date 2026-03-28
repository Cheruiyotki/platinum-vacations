CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(80) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  cost VARCHAR(80) NOT NULL,
  dates VARCHAR(120) NOT NULL,
  duration_banner VARCHAR(60),
  date_pill VARCHAR(120),
  description TEXT,
  includes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  excludes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  pickup_point VARCHAR(255),
  note TEXT,
  image_url TEXT NOT NULL,
  deposit_required INTEGER NOT NULL CHECK (deposit_required >= 0),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);
