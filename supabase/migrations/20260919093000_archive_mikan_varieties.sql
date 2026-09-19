-- Treat is_visible as an archive flag for varieties.
-- Archived varieties remain readable so historical posts keep their labels,
-- but client-side pickers can exclude them with is_visible = true.
-- Physical deletion is intentionally unavailable through the authenticated API.

drop policy if exists "admins can delete mikan varieties"
on public.mikan_varieties;
