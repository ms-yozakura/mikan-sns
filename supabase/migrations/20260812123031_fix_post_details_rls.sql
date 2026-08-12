DROP POLICY "authenticated can all" ON public.post_mikans;

CREATE POLICY "post owners can insert post mikans" ON public.post_mikans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.posts
      WHERE posts.id = post_mikans.post_id
        AND posts.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "post owners can update post mikans" ON public.post_mikans
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts
      WHERE posts.id = post_mikans.post_id
        AND posts.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.posts
      WHERE posts.id = post_mikans.post_id
        AND posts.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "post owners can delete post mikans" ON public.post_mikans
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts
      WHERE posts.id = post_mikans.post_id
        AND posts.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY "authenticated can access" ON public.post_images;

CREATE POLICY "public can select post images" ON public.post_images
  FOR SELECT
  USING (true);

CREATE POLICY "post owners can insert post images" ON public.post_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.posts
      WHERE posts.id = post_images.post_id
        AND posts.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "post owners can update post images" ON public.post_images
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts
      WHERE posts.id = post_images.post_id
        AND posts.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.posts
      WHERE posts.id = post_images.post_id
        AND posts.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "post owners can delete post images" ON public.post_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts
      WHERE posts.id = post_images.post_id
        AND posts.user_id = (SELECT auth.uid())
    )
  );
