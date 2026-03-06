-- Run this SQL in your Supabase SQL Editor to create the required tables and security policies

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  weight int DEFAULT 60,
  updated_at timestamp with time zone,
  PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING ( auth.uid() = id );

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING ( auth.uid() = id );

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK ( auth.uid() = id );

-- 2. Create Fever Logs Table
CREATE TABLE public.fever_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day integer NOT NULL,
  temp numeric NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.fever_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own fever logs" 
  ON public.fever_logs FOR ALL 
  USING ( auth.uid() = user_id ) 
  WITH CHECK ( auth.uid() = user_id );

-- 3. Create Hydration Logs Table
CREATE TABLE public.hydration_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_ml integer NOT NULL,
  fluid_type text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own hydration logs" 
  ON public.hydration_logs FOR ALL 
  USING ( auth.uid() = user_id ) 
  WITH CHECK ( auth.uid() = user_id );

-- 4. Create Lab Results Table
CREATE TABLE public.lab_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day integer NOT NULL,
  ns1 text,
  igm text,
  igg text,
  hematokrit numeric,
  trombosit integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own lab results" 
  ON public.lab_results FOR ALL 
  USING ( auth.uid() = user_id ) 
  WITH CHECK ( auth.uid() = user_id );

-- 5. Auto-create profile trigger on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
