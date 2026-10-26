# Fastify + Prisma Backend Architecture & API Specification

This document details the backend server architecture, PostgreSQL database schema, ingestion pipeline, and REST API specification.

---

## 🛠️ Backend Stack & Directory Structure

- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify v5
- **ORM**: Prisma ORM v6
- **Database**: PostgreSQL (Supabase / Local Postgres)
- **Object Storage**: AWS S3 / Supabase Storage S3 API via `@aws-sdk/client-s3`
- **Validation**: Zod v3

### Directory Layout

```
server/
├── .env.example            # Environment variables template
├── package.json            # Fastify & Prisma dependencies
├── tsconfig.json           # TypeScript configuration
├── prisma/
│   └── schema.prisma       # Prisma ORM schema
└── src/
    ├── db.ts               # Prisma Client singleton
    ├── test-db.ts          # Database pool verification script
    ├── server.ts           # Fastify server entry point
    ├── routes/
    │   ├── explore.ts      # GET /api/v1/explore & POST /api/v1/places
    │   └── upload.ts       # POST /api/v1/places/upload-image
    ├── services/
    │   ├── location-ingestion.ts # 500m/7-day caching + scraping + LLM parsing
    │   └── storage.ts      # S3 object storage upload handler
    └── schemas/
        └── place-details.ts# Zod schemas for historical/restaurant/event details
```

---

## 🗄️ Prisma Database Schema (`server/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Category {
  HISTORICAL
  CULTURAL
  SIGHTSEEING
  RESTAURANT
  EVENT
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  places    Place[]

  @@map("users")
}

model Place {
  id                String     @id @default(cuid())
  title             String
  description       String
  category          Category
  latitude          Float
  longitude         Float
  address           String?
  coverImage        String?
  rating            Float      @default(0.0)
  sourceUrl         String?
  isUserGenerated   Boolean    @default(false)

  // Expanded Category-Specific Structured Details
  historicalDetails Json?
  restaurantDetails Json?
  eventDetails      Json?

  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  userId            String?
  user              User?      @relation(fields: [userId], references: [id], onDelete: SetNull)

  shareLogs         ShareLog[]

  @@index([latitude, longitude])
  @@index([category])
  @@map("places")
}

model ShareLog {
  id        String   @id @default(cuid())
  placeId   String
  place     Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)
  platform  String
  sharedAt  DateTime @default(now())

  @@index([placeId])
  @@map("share_logs")
}
```

---

## 🌐 REST API Specification

### 1. `GET /api/v1/explore`
- **Query Params**: `lat` (float), `lng` (float), `query` (string), `category` (enum), `page` (int), `limit` (int)
- **Validation**: Strict Zod query schema (`ExploreQuerySchema`).
- **Behavior**:
  1. Checks PostgreSQL database for a cached place within 500m created in the last 7 days.
  2. If missing, triggers web scraper (Wikipedia REST API) and OpenAI LLM structured parsing.
  3. Combines scraped data with User Generated Content (UGC), calculates Haversine proximity, sorts closest first, and paginates.

### 2. `POST /api/v1/places`
- **Body**: `{ title, description, category, latitude, longitude, address, coverImage }`
- **Validation**: Strict Zod body schema (`CreatePlaceBodySchema`).
- **Behavior**: Creates a new `Place` record with `isUserGenerated: true` and returns `201 Created`.

### 3. `POST /api/v1/places/upload-image`
- **Headers**: `multipart/form-data`
- **Validation**:
  - Restricts MIME types to `image/jpeg`, `image/png`, `image/webp`.
  - Enforces a maximum file size constraint of **5MB**.
- **Behavior**: Generates a collision-resistant UUID filename (`crypto.randomUUID()`), streams to cloud storage, and returns `{ "imageUrl": "https://..." }`.
