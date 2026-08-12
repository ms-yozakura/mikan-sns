DROP POLICY "authenticated can all" ON public.users;

-- User directory data remains readable, but only its owner may modify a row.
CREATE POLICY "users can update own row" ON public.users
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- There is intentionally no INSERT policy: user rows are created by the
-- handle_new_user auth trigger. There is also no DELETE policy; account
-- deletion must go through a dedicated auth/account-deletion flow.

DROP POLICY "authenticated can all" ON public.profiles;

CREATE POLICY "authenticated can select profiles" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users can insert own profile" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "users can update own profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "users can delete own profile" ON public.profiles
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
