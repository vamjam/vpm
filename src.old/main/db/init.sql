CREATE TABLE IF NOT EXISTS "package_images" (
	"packageId"	INTEGER NOT NULL,
	"imageId"	INTEGER NOT NULL,
	FOREIGN KEY("imageId") REFERENCES "images"("id"),
	FOREIGN KEY("packageId") REFERENCES "packages"("id"),
	PRIMARY KEY("imageId","packageId")
);
CREATE TABLE IF NOT EXISTS "images" (
	"id"	INTEGER NOT NULL,
	"url"	TEXT NOT NULL UNIQUE,
	"sort"	INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "creators" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL UNIQUE,
	"avatar"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
INSERT INTO "creators" ("id", "name", "avatar") VALUES (1, "SELF", NULL);
CREATE TABLE IF NOT EXISTS "packages" (
	"id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
	"creatorId"	INTEGER NOT NULL,
	"type"	TEXT NOT NULL,
	"tags"	TEXT,
	FOREIGN KEY("creatorId") REFERENCES "creators"("name"),
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "dependencies" (
	"id"	INTEGER NOT NULL,
	"packageId"	INTEGER NOT NULL,
	"creatorId"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
	"version"	TEXT NOT NULL,
	FOREIGN KEY("packageId") REFERENCES "packages"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "sources" (
	"id"	INTEGER NOT NULL,
	"packageId"	INTEGER NOT NULL,
	"url"	TEXT,
	"size"	INTEGER,
	"createdAt"	INTEGER NOT NULL,
	"updatedAt"	INTEGER,
	"version"	INTEGER,
	"description"	TEXT,
	"instructions"	INTEGER,
	"credits"	TEXT,
	"licenseType"	TEXT,
	"isActive"	INTEGER NOT NULL DEFAULT 1,
	FOREIGN KEY("packageId") REFERENCES "packages"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE INDEX IF NOT EXISTS "idx_package_name" ON "packages" (
	"name"
);
