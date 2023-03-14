CREATE TABLE IF NOT EXISTS addons (
  id INTEGER,
  assetId INTEGER NOT NULL,
  createdAt INTEGER,
  size INTEGER,
  description TEXT,
  instructions TEXT,
  credits TEXT,
  licenseType TEXT,
  FOREIGN KEY(assetId) REFERENCES assets(id),
  PRIMARY KEY(id AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS creators (
  id INTEGER,
  name TEXT NOT NULL,
  avatar TEXT,
  PRIMARY KEY(id AUTOINCREMENT),
  UNIQUE (name COLLATE NOCASE)
);

CREATE TABLE IF NOT EXISTS dependencies (
  id INTEGER,
  assetId INTEGER NOT NULL,
  creatorId INTEGER NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  FOREIGN KEY(creatorId) REFERENCES creators(id),
  FOREIGN KEY(assetId) REFERENCES assets(id),
  PRIMARY KEY(id AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS images (
  id INTEGER,
  url TEXT NOT NULL UNIQUE,
  assetId INTEGER,
  sort INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(assetId) REFERENCES assets(id),
  PRIMARY KEY(id AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS assets (
  id INTEGER,
  createdAt INTEGER,
  size INTEGER,
  name TEXT NOT NULL,
  version INTEGER,
  creatorId INTEGER,
  url TEXT NOT NULL UNIQUE,
  type INTEGER,
  FOREIGN KEY(creatorId) REFERENCES creators(id),
  PRIMARY KEY(id AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS addon_assets (
  addonId INTEGER,
  assetId INTEGER,
  FOREIGN KEY(addonId) REFERENCES addons(id),
  FOREIGN KEY(assetId) REFERENCES assets(id),
  PRIMARY KEY(addonId, assetId)
);

CREATE UNIQUE INDEX IF NOT EXISTS creator_name ON creators (name ASC);

CREATE INDEX IF NOT EXISTS asset_name ON assets (name ASC);