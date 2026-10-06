-- NutriScan Supabase Database Migration Schema

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  age INTEGER,
  sex TEXT CHECK (sex IN ('male', 'female')),
  height_cm NUMERIC,
  weight_kg NUMERIC,
  activity_level TEXT,
  goal TEXT,
  diet_type TEXT,
  allergies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Foods Table
CREATE TABLE IF NOT EXISTS public.foods (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_id TEXT,
  name TEXT NOT NULL,
  aliases TEXT[],
  per_100g JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Food Aliases Table
CREATE TABLE IF NOT EXISTS public.food_aliases (
  alias TEXT PRIMARY KEY,
  food_id TEXT REFERENCES public.foods(id) ON DELETE CASCADE
);

-- 4. Meal Logs Table
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  meal_type TEXT NOT NULL,
  image_url TEXT,
  total JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own meal logs" ON public.meal_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal logs" ON public.meal_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Meal Log Items Table
CREATE TABLE IF NOT EXISTS public.meal_log_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_log_id UUID REFERENCES public.meal_logs(id) ON DELETE CASCADE NOT NULL,
  food_id TEXT REFERENCES public.foods(id),
  grams NUMERIC NOT NULL,
  nutrition JSONB NOT NULL
);

ALTER TABLE public.meal_log_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own meal log items" ON public.meal_log_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.meal_logs WHERE public.meal_logs.id = meal_log_items.meal_log_id AND public.meal_logs.user_id = auth.uid())
);

-- 6. Weight Logs Table
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  weight_kg NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own weight logs" ON public.weight_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight logs" ON public.weight_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Meal Plans Table
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  targets JSONB NOT NULL,
  plan JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own meal plans" ON public.meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal plans" ON public.meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
