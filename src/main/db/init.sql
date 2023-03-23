CREATE TABLE IF NOT EXISTS creators (
  id INTEGER,
  name TEXT NOT NULL,
  avatar TEXT,
  userId INTEGER,
  PRIMARY KEY(id AUTOINCREMENT),
  UNIQUE (name COLLATE NOCASE)
);

CREATE TABLE IF NOT EXISTS dependencies (
  id INTEGER,
  dependentId INTEGER NOT NULL,
  dependencyId INTEGER NOT NULL,
  version TEXT NOT NULL,
  FOREIGN KEY(dependentId) REFERENCES assets(id),
  FOREIGN KEY(dependencyId) REFERENCES assets(id),
  PRIMARY KEY(id AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS images (
  id INTEGER,
  path TEXT NOT NULL UNIQUE,
  assetId INTEGER,
  sort INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(assetId) REFERENCES assets(id),
  PRIMARY KEY(id AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS assets (
  id INTEGER,
  name TEXT NOT NULL,
  creatorId INTEGER,
  type INTEGER,
  tags TEXT,
  description TEXT,
  instructions TEXT,
  credits TEXT,
  licenseType TEXT,
  packageId INTEGER,
  resourceId INTEGER,
  hubHosted INTEGER,
  hubDownloadable INTEGER,
  releaseDate INTEGER,
  discussionThreadId INTEGER,
  FOREIGN KEY(creatorId) REFERENCES creators(id),
  PRIMARY KEY(id AUTOINCREMENT),
  UNIQUE(creatorId, name)
);

CREATE TABLE IF NOT EXISTS asset_files (
  id INTEGER,
  assetId INTEGER NOT NULL,
  path TEXT NOT NULL UNIQUE,
  createdAt INTEGER,
  updatedAt INTEGER,
  version INTEGER,
  size INTEGER,
  FOREIGN KEY(assetId) REFERENCES assets(id),
  PRIMARY KEY(id AUTOINCREMENT)
);

CREATE UNIQUE INDEX IF NOT EXISTS creator_name ON creators (name ASC);

CREATE INDEX IF NOT EXISTS asset_name ON assets (name ASC);