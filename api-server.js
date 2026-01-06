import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// List users endpoint
app.get('/api/list-users', async (req, res) => {
  try {
    const { data, error: fetchError } = await supabase.auth.admin.listUsers();

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

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
});

// Save subscription endpoint
app.post('/api/save-subscription', async (req, res) => {
  try {
    const { subscription, userId } = req.body;

    if (!subscription || !userId) {
      return res.status(400).json({ error: 'Missing subscription or userId' });
    }

    const { error: upsertError } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          subscription: subscription,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

    if (upsertError) {
      console.error('Error saving subscription:', upsertError);
      return res.status(500).json({ error: 'Failed to save subscription' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in save-subscription handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Send push notification endpoint
app.post('/api/send-push', async (req, res) => {
  try {
    const { userId, title, body } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user's push subscription
    const { data: subscriptionData, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId)
      .single();

    if (fetchError || !subscriptionData) {
      console.error('Error fetching subscription:', fetchError);
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const webpush = await import('web-push');
    
    const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:example@yourdomain.com';

    webpush.default.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon.png',
      badge: '/badge.png',
    });

    await webpush.default.sendNotification(subscriptionData.subscription, payload);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
