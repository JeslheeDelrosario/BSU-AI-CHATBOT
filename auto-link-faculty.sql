-- Auto-Link Faculty to Users by Email
-- This SQL script links all faculty records to user accounts by matching email addresses
-- Run this in your PostgreSQL database

-- Step 1: Check current status
SELECT 
  COUNT(*) as total_faculty,
  COUNT(CASE WHEN "userId" IS NOT NULL THEN 1 END) as linked,
  COUNT(CASE WHEN "userId" IS NULL THEN 1 END) as unlinked
FROM "Faculty";

-- Step 2: Show which faculty will be linked
SELECT 
  f.id as faculty_id,
  f."firstName",
  f."lastName",
  f.email as faculty_email,
  u.id as user_id,
  u.email as user_email,
  u.role
FROM "Faculty" f
LEFT JOIN "User" u ON f.email = u.email
WHERE f."userId" IS NULL
ORDER BY f."lastName", f."firstName";

-- Step 3: Auto-link faculty to users by email
UPDATE "Faculty" f
SET "userId" = u.id
FROM "User" u
WHERE f.email = u.email
  AND f."userId" IS NULL
  AND f.email IS NOT NULL;

-- Step 4: Verify the links were created
SELECT 
  COUNT(*) as total_faculty,
  COUNT(CASE WHEN "userId" IS NOT NULL THEN 1 END) as linked,
  COUNT(CASE WHEN "userId" IS NULL THEN 1 END) as unlinked
FROM "Faculty";

-- Step 5: Show all linked faculty
SELECT 
  f.id,
  f."firstName",
  f."lastName",
  f.email,
  f."userId",
  u.email as user_email,
  u.role
FROM "Faculty" f
JOIN "User" u ON f."userId" = u.id
ORDER BY f."lastName", f."firstName";

-- Step 6: Show any unlinked faculty (if any)
SELECT 
  f.id,
  f."firstName",
  f."lastName",
  f.email,
  f."userId"
FROM "Faculty" f
WHERE f."userId" IS NULL
ORDER BY f."lastName", f."firstName";
