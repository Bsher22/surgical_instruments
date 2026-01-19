# SurgicalPrep - Stage 1A: Supabase Setup

This package contains everything you need to set up the Supabase infrastructure for SurgicalPrep.

## 📁 Package Contents

```
surgicalprep-stage1a/
├── database/
│   ├── schema.sql          # Main database schema (6 tables, indexes, functions)
│   ├── rls_policies.sql    # Row Level Security policies
│   └── seed_sample_data.sql # Sample instruments for testing
├── .env.example            # Environment variables template
└── README.md               # This file
```

## ✅ Checklist

- [ ] Create Supabase project
- [ ] Run schema.sql
- [ ] Run rls_policies.sql
- [ ] Create storage bucket
- [ ] Run seed_sample_data.sql (optional, for testing)
- [ ] Export credentials to .env

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create account)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `surgicalprep` (or your preferred name)
   - **Database Password**: Generate a strong password and **SAVE IT** - you'll need it for `DATABASE_URL`
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to provision

---

## Step 2: Run the Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the entire contents of `database/schema.sql`
4. Paste into the SQL Editor
5. Click **"Run"** (or Cmd/Ctrl + Enter)
6. Verify you see green success messages for all statements

**What this creates:**
- 4 enum types (user_role, subscription_tier, instrument_category, etc.)
- 6 tables (users, instruments, preference_cards, preference_card_items, user_instrument_progress, quiz_sessions)
- Indexes for performance
- Full-text search configuration
- Helper functions (search_instruments, count_user_cards, etc.)
- Auto-updating timestamps

---

## Step 3: Configure Row Level Security

1. Still in **SQL Editor**, click **"New query"**
2. Copy the entire contents of `database/rls_policies.sql`
3. Paste and click **"Run"**
4. Verify success messages

**What this configures:**
- RLS enabled on all tables
- Users can only access their own data (cards, progress, quizzes)
- Instruments are publicly readable
- Public template cards are visible to all
- Proper insert/update/delete permissions

---

## Step 4: Create Storage Bucket

1. Go to **Storage** (left sidebar)
2. Click **"New bucket"**
3. Configure:
   - **Name**: `instrument-images`
   - **Public bucket**: ✅ Toggle ON (allows public read access)
4. Click **"Create bucket"**

**Storage Policy (for uploads):**
1. Click on your `instrument-images` bucket
2. Go to **Policies** tab
3. Under "Other policies", click **"New policy"**
4. Choose **"For full customization"**
5. Policy name: `Allow authenticated uploads`
6. Operations: SELECT `INSERT`, `UPDATE`, `DELETE`
7. Target roles: `authenticated`
8. Using expression: `true`
9. Click **"Review"** then **"Save policy"**

---

## Step 5: Seed Sample Data (Optional)

For testing purposes, you can add sample instruments:

1. In **SQL Editor**, create a new query
2. Copy contents of `database/seed_sample_data.sql`
3. Paste and run

**This adds:**
- ~20 sample surgical instruments across categories
- 1 template preference card (Lap Chole setup)
- Demonstrates the data structure

---

## Step 6: Export Credentials

Get these values from your Supabase project:

### API Credentials (Project Settings > API)

1. **SUPABASE_URL**: Project URL (looks like `https://xxxxx.supabase.co`)
2. **SUPABASE_ANON_KEY**: `anon` `public` key (safe for frontend)
3. **SUPABASE_SERVICE_KEY**: `service_role` key (**KEEP SECRET**)

### Database Connection (Project Settings > Database)

4. **DATABASE_URL**: Connection string > URI
   - Click "Reveal" to show password
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`

### Create Your .env File

```bash
# Copy the template
cp .env.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

Fill in all the Supabase values. You can skip the Stripe values for now (Stage 8).

---

## 🔍 Verify Setup

Run these queries in SQL Editor to verify everything works:

### Check tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected: users, instruments, preference_cards, preference_card_items, user_instrument_progress, quiz_sessions

### Check RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Expected: All tables should show `t` (true) for rowsecurity

### Test full-text search (after seeding):
```sql
SELECT name, category 
FROM instruments 
WHERE search_vector @@ plainto_tsquery('english', 'scissors');
```

Expected: Mayo and Metzenbaum scissors

### Check instrument count:
```sql
SELECT category, COUNT(*) 
FROM instruments 
GROUP BY category;
```

---

## 🚀 Next Steps

After completing Stage 1A, proceed to:

- **Stage 1B**: Deploy FastAPI backend to Railway
- **Stage 1C**: Set up local development environment

Your Supabase infrastructure is now ready!

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)

---

## 🐛 Troubleshooting

### "permission denied" errors
- Ensure RLS policies are correctly applied
- Check that you're using the correct API key (anon vs service_role)

### Full-text search not returning results
- Verify the trigger was created: `SELECT tgname FROM pg_trigger WHERE tgname LIKE '%instrument%'`
- Update search vectors: `UPDATE instruments SET name = name;` (triggers rebuild)

### Storage upload fails
- Check bucket is set to public
- Verify upload policy exists for authenticated users

### Connection refused to database
- Verify DATABASE_URL is correct
- Check if your IP needs to be whitelisted (Project Settings > Database > Connection Pooling)
