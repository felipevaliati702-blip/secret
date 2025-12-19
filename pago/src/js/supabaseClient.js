// Supabase Configuration
// REPLACE THESE WITH YOUR OWN SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY';

// Initialize Client
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Unique User Identity (Stored in Browser)
function getUserId() {
    let id = localStorage.getItem('secret_user_id');
    if (!id) {
        // Generate a random UUID-like string
        id = crypto.randomUUID();
        localStorage.setItem('secret_user_id', id);
    }
    return id;
}

const USER_ID = getUserId();
