import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch users from Supabase Auth admin API
    const { data, error: fetchError } = await supabase.auth.admin.listUsers();

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    // Map users to a simpler format
    const users = data.users.map(user => ({
      id: user.id,
      email: user.email || 'No email',
      created_at: user.created_at,
    }));

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error in list-users handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
