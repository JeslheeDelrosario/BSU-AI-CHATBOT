-- 🚀 COPY AND PASTE THIS TO FIX NOTIFICATIONS NOW

-- Step 1: Check before
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN "userId" IS NOT NULL THEN 1 END) as linked,
  COUNT(CASE WHEN "userId" IS NULL THEN 1 END) as unlinked
FROM "Faculty";

-- Step 2: AUTO-LINK (THE FIX)
UPDATE "Faculty" f
SET "userId" = u.id
FROM "User" u
WHERE f.email = u.email
  AND f."userId" IS NULL
  AND f.email IS NOT NULL;

-- Step 3: Check after (should show unlinked: 0)
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN "userId" IS NOT NULL THEN 1 END) as linked,
  COUNT(CASE WHEN "userId" IS NULL THEN 1 END) as unlinked
FROM "Faculty";

-- Step 4: See what was linked
SELECT 
  f."firstName",
  f."lastName",
  f.email,
  u.email as user_email,
  u.role
FROM "Faculty" f
JOIN "User" u ON f."userId" = u.id
ORDER BY f."lastName";
