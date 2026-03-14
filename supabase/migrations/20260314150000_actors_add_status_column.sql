-- Add explicit status column to actors table
-- Replaces the implicit status derived from is_active + auth_user_id
--
-- Status meanings:
--   draft          → Created by admin, no invite sent yet
--   pending_invite → Invite email sent, user hasn't accepted
--   active         → User has logged in and is active
--   disabled       → Access disabled by admin
--   deleted        → Soft-deleted (hidden from normal views)

ALTER TABLE public.actors
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft'
CHECK (status IN ('draft', 'pending_invite', 'active', 'disabled', 'deleted'));

-- Backfill existing rows based on current field values:
-- auth_user_id is NOT NULL and is_active = true  → active
-- auth_user_id is NULL and is_active = true       → draft (no invite sent yet)
-- is_active = false                               → disabled
UPDATE public.actors
SET status = CASE
  WHEN is_active = false            THEN 'disabled'
  WHEN auth_user_id IS NOT NULL     THEN 'active'
  ELSE                                   'draft'
END
WHERE status = 'draft';  -- only touch rows not yet assigned
