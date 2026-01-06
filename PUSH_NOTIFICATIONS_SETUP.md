# Environment Variables Setup

## Required Environment Variables

### For Local Development (.env.local)
```env
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# VAPID Keys (generate using: npx web-push generate-vapid-keys)
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### For Vercel Deployment
Add these same variables in your Vercel project settings under "Environment Variables"

## Generate VAPID Keys

Run this command to generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

This will output:
- Public Key (add as `VITE_VAPID_PUBLIC_KEY`)
- Private Key (add as `VAPID_PRIVATE_KEY`)

## Setup Steps

1. **Generate VAPID keys:**
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Run Supabase migration:**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the contents of `supabase-push-subscriptions.sql`

3. **Configure environment variables:**
   - For local: Create `.env.local` with the variables above
   - For Vercel: Add all variables in project settings

4. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Add push notification functionality"
   git push
   ```

5. **Test on iPhone:**
   - Open the app in Safari
   - Tap the Share button
   - Select "Add to Home Screen"
   - Open the app from your home screen
   - Sign in and grant notification permissions
   - See the list of users and tap to send notifications
