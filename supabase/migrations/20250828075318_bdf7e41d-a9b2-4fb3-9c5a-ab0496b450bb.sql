-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('employer', 'housegirl', 'agency');

-- Create enum for education levels
CREATE TYPE public.education_level AS ENUM ('primary', 'form_2', 'form_4', 'certificate', 'diploma', 'degree');

-- Create enum for experience levels
CREATE TYPE public.experience_level AS ENUM ('no_experience', '1_year', '2_years', '3_years', '4_years', '5_plus_years');

-- Create enum for accommodation type
CREATE TYPE public.accommodation_type AS ENUM ('live_in', 'live_out', 'both');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_type user_type NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create housegirl profiles table
CREATE TABLE public.housegirl_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  age INTEGER NOT NULL,
  tribe TEXT NOT NULL,
  location TEXT NOT NULL,
  current_location TEXT NOT NULL,
  expected_salary INTEGER NOT NULL, -- in KES
  education education_level NOT NULL,
  experience experience_level NOT NULL,
  accommodation_type accommodation_type NOT NULL,
  bio TEXT,
  profile_photo_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create employer profiles table
CREATE TABLE public.employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  company_name TEXT,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create agency profiles table
CREATE TABLE public.agency_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  agency_name TEXT NOT NULL,
  license_number TEXT,
  location TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payment packages table
CREATE TABLE public.payment_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL, -- in KES
  contacts_included INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user purchases table
CREATE TABLE public.user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES public.payment_packages(id) NOT NULL,
  amount_paid INTEGER NOT NULL,
  contacts_remaining INTEGER NOT NULL,
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  mpesa_transaction_id TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Create contact access table
CREATE TABLE public.contact_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchaser_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(purchaser_id, target_profile_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housegirl_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_access ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for housegirl profiles
CREATE POLICY "Anyone can view housegirl profiles" ON public.housegirl_profiles FOR SELECT USING (true);
CREATE POLICY "Profile owners can insert housegirl profile" ON public.housegirl_profiles 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Profile owners can update housegirl profile" ON public.housegirl_profiles 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

-- Create RLS policies for employer profiles
CREATE POLICY "Anyone can view employer profiles" ON public.employer_profiles FOR SELECT USING (true);
CREATE POLICY "Profile owners can insert employer profile" ON public.employer_profiles 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Profile owners can update employer profile" ON public.employer_profiles 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

-- Create RLS policies for agency profiles
CREATE POLICY "Anyone can view agency profiles" ON public.agency_profiles FOR SELECT USING (true);
CREATE POLICY "Profile owners can insert agency profile" ON public.agency_profiles 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Profile owners can update agency profile" ON public.agency_profiles 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

-- Create RLS policies for payment packages
CREATE POLICY "Anyone can view active packages" ON public.payment_packages FOR SELECT USING (is_active = true);

-- Create RLS policies for user purchases
CREATE POLICY "Users can view their own purchases" ON public.user_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own purchases" ON public.user_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for contact access
CREATE POLICY "Users can view their own contact access" ON public.contact_access FOR SELECT USING (auth.uid() = purchaser_id);
CREATE POLICY "Users can insert their own contact access" ON public.contact_access FOR INSERT WITH CHECK (auth.uid() = purchaser_id);

-- Insert default payment packages
INSERT INTO public.payment_packages (name, price, contacts_included, description) VALUES
('Single Contact', 200, 1, 'Access one contact number'),
('Three Contacts', 500, 3, 'Access three contact numbers'),
('Four Contacts', 600, 4, 'Access four contact numbers'),
('Agency Package', 2000, 15, 'Agency access to 15 contact numbers'),
('Monthly Package', 6000, 50, 'Monthly access to 50 contact numbers (billed yearly)'),
('Housegirl Employer Access', 1500, 1, 'Housegirl access to one employer contact');

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_housegirl_profiles_updated_at
  BEFORE UPDATE ON public.housegirl_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employer_profiles_updated_at
  BEFORE UPDATE ON public.employer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agency_profiles_updated_at
  BEFORE UPDATE ON public.agency_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();