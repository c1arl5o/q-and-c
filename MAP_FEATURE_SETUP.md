# Map Game Feature - Setup Guide

## Overview
The Map feature adds a motivational gamification layer to your sports tracker. Users collect coins for activities and use them to unlock tiles in a cozy 6x6 town together.

## Database Setup

### Step 1: Run the Migration
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Open and run the file: `supabase-coins-and-tiles.sql`

This will:
- Add a `coins` column to the `profiles` table
- Create a new `tiles` table with contribution tracking
- Initialize a 6x6 grid with random tile types
- Set up Row Level Security policies
- Create automatic unlock triggers

### Step 2: Verify Tables
After running the migration, verify that:
- `profiles` table has a `coins` column (default: 0)
- `tiles` table exists with 36 tiles (6x6 grid)
- All tiles should be unlocked=false initially

## How It Works

### Coin System
Users earn coins by logging activities:
- **Walking**: 5 coins 🚶
- **Running**: 10 coins 🏃
- **Swimming**: 15 coins 🏊

### Tile Unlocking (Two-Player Requirement)
Each tile has an `unlock_cost` (ranges from 50-160 coins based on position).

**Key Rule**: Both users must contribute **at least 50%** of the unlock cost:
- User 1 contribution: minimum 50% of unlock_cost
- User 2 contribution: minimum 50% of unlock_cost
- Total required: 100% of unlock_cost

**Example**: 
- Tile cost: 100 coins
- User 1 must contribute: ≥50 coins
- User 2 must contribute: ≥50 coins
- Only when both thresholds are met → tile unlocks! 🎉

### Tile Types
The map features various tile types (randomly assigned):
- 🛣️ Road
- 🏠 House  
- 🏪 Shop
- 🌲 Forest
- 🌳 Park
- 🏢 Building
- 🔒 Locked (not yet unlocked)

## Features

### 1. Activity Logging with Coin Rewards
When users log an activity (in the Add > Activity section), they automatically receive coins based on the activity type.

### 2. The Map View
Access via sidebar: **Home → The Map**

- **6x6 Grid**: Visual representation of the cozy town
- **Locked Tiles**: Show 🔒 icon and progress bar
- **Progress Bar**: Shows combined contribution progress
- **Unlocked Tiles**: Show their actual emoji/icon

### 3. Contributing to Tiles
1. Click any locked tile
2. Modal opens showing:
   - Tile type and unlock cost
   - Current progress for both users
   - Your available coins
3. Enter contribution amount (max 50% of unlock cost)
4. Click "Contribute"

### 4. Real-time Coin Display
- Home page shows current coin balance
- Updates immediately after activities
- Updates after contributing to tiles

## Technical Implementation

### Database Tables

#### profiles (modified)
```sql
- id (uuid, primary key)
- email (text)
- display_name (text)
- coins (integer, default: 0)  ← NEW
- created_at, updated_at
```

#### tiles (new)
```sql
- id (uuid, primary key)
- position_x (integer, 0-5)
- position_y (integer, 0-5)
- tile_type (text: road, house, shop, forest, park, building)
- unlock_cost (integer, 50-160)
- user1_contribution (integer, default: 0)
- user2_contribution (integer, default: 0)
- is_unlocked (boolean, default: false)
- created_at, updated_at
```

### Automatic Unlock Trigger
A PostgreSQL trigger automatically sets `is_unlocked = true` when:
```
user1_contribution >= (unlock_cost / 2) AND
user2_contribution >= (unlock_cost / 2)
```

## Testing

### Test Scenario
1. **User 1**: Log a running activity → earn 10 coins
2. **User 1**: Go to The Map, click a tile (cost: 60 coins)
3. **User 1**: Contribute 30 coins (50%) → tile still locked
4. **User 2**: Log a swimming activity → earn 15 coins  
5. **User 2**: Go to The Map, click same tile
6. **User 2**: Contribute 30 coins (50%) → tile unlocks! 🎉

## Future Enhancements (Optional)

### Potential Additions:
1. **User ID Tracking**: Store which specific users contributed (not just user1/user2)
2. **Custom Images**: Replace emojis with actual tile artwork
3. **Tile Rewards**: Unlock special bonuses when completing tile sets
4. **Animations**: Add unlock animations and celebrations
5. **Tile Descriptions**: Add lore/descriptions for each tile type
6. **Achievements**: Track progress and milestones
7. **Leaderboard**: Show who contributed most to the town

## Troubleshooting

### Coins not updating after activity
- Check that the `profiles` table has the `coins` column
- Verify the user exists in the `profiles` table
- Check browser console for errors

### Tiles not unlocking
- Verify both users have contributed ≥50% each
- Check the trigger `check_tile_unlock()` is active
- Manually check tile data in Supabase dashboard

### Can't contribute more than 50%
- This is intentional! The limit ensures both users participate
- Each user can only contribute up to 50% of the unlock cost

## Files Created/Modified

### New Files:
- `supabase-coins-and-tiles.sql` - Database migration
- `src/components/Map.tsx` - Map component
- `src/components/Map.css` - Map styling
- `MAP_FEATURE_SETUP.md` - This file

### Modified Files:
- `src/components/add-components/Activity.tsx` - Added coin rewards
- `src/components/Home.tsx` - Added coin display & Map navigation
- `src/App.tsx` - Added Map routing
- All components with view props - Updated type definitions

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify the database migration ran successfully
3. Check Supabase logs for any policy violations
4. Ensure Row Level Security is properly configured

---

**Enjoy building your cozy town together! 🏘️**
