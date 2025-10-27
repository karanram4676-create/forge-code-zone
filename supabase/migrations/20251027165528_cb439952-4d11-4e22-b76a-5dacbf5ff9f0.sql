-- Fix the handle_new_user function to trim usernames
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    TRIM(COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)))
  );
  RETURN NEW;
END;
$$;

-- Clean up existing usernames by trimming trailing spaces
UPDATE public.profiles 
SET username = TRIM(username)
WHERE username != TRIM(username);