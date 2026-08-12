-- The auth trigger can still invoke this function without exposing it as an RPC.
-- Revoke PUBLIC as well as the explicit grants present in the baseline schema.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
