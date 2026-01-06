import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

// Initialize Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configure web-push
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidPublicKey,
  vapidPrivateKey
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { targetUserId, title, body } = req.body;

    if (!targetUserId || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch the user's push subscription from database
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('active', true);

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({ error: 'No active subscriptions found for user' });
    }

    // Send push notification to all active subscriptions for this user
    const payload = JSON.stringify({
      title,
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          return { success: true, subscriptionId: sub.id };
        } catch (error: any) {
          console.error('Error sending to subscription:', sub.id, error);
          
          // If subscription is no longer valid, mark it as inactive
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .update({ active: false })
              .eq('id', sub.id);
          }
          
          return { success: false, subscriptionId: sub.id, error };
        }
      })
    );

    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;

    return res.status(200).json({
      message: 'Push notifications sent',
      totalSubscriptions: subscriptions.length,
      successCount,
    });
  } catch (error) {
    console.error('Error in send-push handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
