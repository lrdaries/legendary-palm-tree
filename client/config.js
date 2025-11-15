 // Supabase Configuration
        const SUPABASE_URL = 'https://lmgndhpebqqsitshxvmd.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ25kaHBlYnFxc2l0c2h4dm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDk1MTAsImV4cCI6MjA3NDU4NTUxMH0.7Y51GQAIJX-y0HO8hWcY5P7f7AM29A-4we9mOAKzBd0';
        
        // Initialize Supabase client
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log(supabaseClient);