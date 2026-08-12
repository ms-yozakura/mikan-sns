-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP EXTENSION pg_net;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

CREATE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  insert into public.users (
    id,
    username,
    display_name
  )
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'display_name'
  );

  return new;
end;
$function$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;

GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;

GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;

CREATE TABLE public.comments (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  body       text,
  post_id    uuid                     DEFAULT gen_random_uuid(),
  user_id    uuid                     NOT NULL
);

ALTER TABLE public.comments
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.comments
  ADD CONSTRAINT comments_pkey PRIMARY KEY (id);

GRANT ALL ON public.comments TO anon;

GRANT ALL ON public.comments TO authenticated;

GRANT ALL ON public.comments TO service_role;

CREATE POLICY "able to add own comment" ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "able to delete own comment" ON public.comments
  FOR DELETE
  TO authenticated
  USING ((auth.uid() = user_id));

CREATE POLICY "able to update own comment" ON public.comments
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "auth can select" ON public.comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE public.follows (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  follower   uuid                     DEFAULT gen_random_uuid(),
  follow     uuid                     DEFAULT gen_random_uuid()
);

ALTER TABLE public.follows
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.follows
  ADD CONSTRAINT follows_pkey PRIMARY KEY (id);

GRANT ALL ON public.follows TO anon;

GRANT ALL ON public.follows TO authenticated;

GRANT ALL ON public.follows TO service_role;

CREATE POLICY "able to add own follow" ON public.follows
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = follower));

CREATE POLICY "able to delete own follow" ON public.follows
  FOR DELETE
  USING ((auth.uid() = follower));

CREATE POLICY "able to update own follow" ON public.follows
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = follower))
  WITH CHECK ((auth.uid() = follower));

CREATE POLICY "authenticated can select" ON public.follows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE public.mikan_varieties (
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  name       text                     NOT NULL,
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  color      text                     DEFAULT '#ff9800'::text NOT NULL,
  shape      text                     DEFAULT 'normal'::text NOT NULL
);

ALTER TABLE public.mikan_varieties
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.mikan_varieties
  ADD CONSTRAINT mikan_variety_pkey PRIMARY KEY (id);

GRANT ALL ON public.mikan_varieties TO anon;

GRANT ALL ON public.mikan_varieties TO authenticated;

GRANT ALL ON public.mikan_varieties TO service_role;

CREATE POLICY "public can select" ON public.mikan_varieties
  FOR SELECT
  USING (true);

CREATE TABLE public.notifications (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  user_id    uuid                     NOT NULL,
  actor_id   uuid                     NOT NULL,
  type       text                     NOT NULL,
  post_id    uuid,
  comment_id uuid,
  is_read    boolean                  DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.notifications
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

GRANT ALL ON public.notifications TO anon;

GRANT ALL ON public.notifications TO authenticated;

GRANT ALL ON public.notifications TO service_role;

CREATE INDEX notifications_unread_idx ON public.notifications (user_id, is_read);

CREATE INDEX notifications_user_created_idx ON public.notifications (user_id, created_at DESC);

CREATE POLICY "auth can select own notification" ON public.notifications
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id));

CREATE POLICY "auth can update own notification" ON public.notifications
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "only actor can insert" ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = actor_id));

CREATE TABLE public.post_images (
  id            uuid                     DEFAULT gen_random_uuid() NOT NULL,
  created_at    timestamp with time zone DEFAULT now() NOT NULL,
  post_id       uuid                     DEFAULT gen_random_uuid(),
  order_index   integer,
  url           text,
  thumbnail_url text
);

ALTER TABLE public.post_images
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.post_images
  ADD CONSTRAINT post_images_pkey PRIMARY KEY (id);

GRANT ALL ON public.post_images TO anon;

GRANT ALL ON public.post_images TO authenticated;

GRANT ALL ON public.post_images TO service_role;

CREATE POLICY "authenticated can access" ON public.post_images
  USING (true)
  WITH CHECK (true);

CREATE TABLE public.post_likes (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  user_id    uuid,
  post_id    uuid
);

ALTER TABLE public.post_likes
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.post_likes
  ADD CONSTRAINT post_likes_pkey PRIMARY KEY (id);

ALTER TABLE public.post_likes
  ADD CONSTRAINT post_likes_user_id_post_id_key UNIQUE (user_id, post_id);

GRANT ALL ON public.post_likes TO anon;

GRANT ALL ON public.post_likes TO authenticated;

GRANT ALL ON public.post_likes TO service_role;

CREATE POLICY "auth can delete own like" ON public.post_likes
  FOR DELETE
  TO authenticated
  USING ((auth.uid() = user_id));

CREATE POLICY "auth can insert own like" ON public.post_likes
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "auth can update own like" ON public.post_likes
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "public can select likes" ON public.post_likes
  FOR SELECT
  USING (true);

CREATE TABLE public.post_mikans (
  id           uuid                     DEFAULT gen_random_uuid() NOT NULL,
  created_at   timestamp with time zone DEFAULT now() NOT NULL,
  variety_id   uuid                     DEFAULT gen_random_uuid(),
  post_id      uuid                     DEFAULT gen_random_uuid(),
  quantity     smallint                 DEFAULT '0'::smallint,
  satisfaction smallint                 DEFAULT '3'::smallint
);

ALTER TABLE public.post_mikans
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.post_mikans
  ADD CONSTRAINT post_mikans_pkey PRIMARY KEY (id);

ALTER TABLE public.post_mikans
  ADD CONSTRAINT post_mikans_variety_id_fkey FOREIGN KEY (variety_id) REFERENCES public.mikan_varieties(id) ON UPDATE CASCADE ON DELETE SET NULL;

GRANT ALL ON public.post_mikans TO anon;

GRANT ALL ON public.post_mikans TO authenticated;

GRANT ALL ON public.post_mikans TO service_role;

CREATE POLICY "authenticated can all" ON public.post_mikans
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public can select" ON public.post_mikans
  FOR SELECT
  USING (true);

CREATE TABLE public.posts (
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  body       text,
  user_id    uuid,
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  visibility text                     DEFAULT 'public'::text NOT NULL
);

ALTER TABLE public.posts
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_pkey PRIMARY KEY (id);

ALTER TABLE public.comments
  ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.post_images
  ADD CONSTRAINT post_images_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.post_likes
  ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.post_mikans
  ADD CONSTRAINT post_mikans_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;

GRANT ALL ON public.posts TO anon;

GRANT ALL ON public.posts TO authenticated;

GRANT ALL ON public.posts TO service_role;

CREATE POLICY "all can delete own post" ON public.posts
  FOR DELETE
  TO authenticated
  USING ((auth.uid() = user_id));

CREATE POLICY "all can insert own post" ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "all can update own post" ON public.posts
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "anonymous forbidden" ON public.posts
  AS RESTRICTIVE
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "public and private select rule" ON public.posts
  FOR SELECT
  TO authenticated
  USING (((visibility = 'public'::text) OR (auth.uid() = user_id)));

CREATE TABLE public.profiles (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  user_id    uuid                     DEFAULT gen_random_uuid() NOT NULL,
  bio        text,
  region     text,
  generation smallint
);

ALTER TABLE public.profiles
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles
  ADD CONSTRAINT profile_pkey PRIMARY KEY (id);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

GRANT ALL ON public.profiles TO anon;

GRANT ALL ON public.profiles TO authenticated;

GRANT ALL ON public.profiles TO service_role;

CREATE POLICY "authenticated can all" ON public.profiles
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE public.users (
  id           uuid                     DEFAULT gen_random_uuid() NOT NULL,
  created_at   timestamp with time zone DEFAULT now() NOT NULL,
  username     text,
  display_name text                     NOT NULL,
  avatar_url   text
);

ALTER TABLE public.users
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.users
  ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE public.comments
  ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.follows
  ADD CONSTRAINT follows_follow_fkey FOREIGN KEY (follow) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.follows
  ADD CONSTRAINT follows_follower_fkey FOREIGN KEY (follower) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.post_likes
  ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;

ALTER TABLE public.profiles
  ADD CONSTRAINT profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.users
  ADD CONSTRAINT users_username_key UNIQUE (username);

GRANT ALL ON public.users TO anon;

GRANT ALL ON public.users TO authenticated;

GRANT ALL ON public.users TO service_role;

CREATE POLICY "authenticated can all" ON public.users
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public can select" ON public.users
  FOR SELECT
  USING (true);
