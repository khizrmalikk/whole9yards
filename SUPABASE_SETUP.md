# Supabase Setup Guide

This guide will help you set up Supabase for your portfolio project.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `whole-9-yards-portfolio` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Choose the closest region to your users
6. Click "Create new project"

## 2. Get Your Project Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Public anon key** (starts with `eyJ...`)

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Portfolio Manager Password (change this!)
PORTFOLIO_MANAGER_PASSWORD=your_secure_password_here
```

⚠️ **Important**: Replace the placeholder values with your actual Supabase credentials.

## 4. Set Up the Database

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the SQL

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run the schema
supabase db push
```

## 5. Set Up Image Storage

1. Go to **Storage** in your Supabase dashboard
2. Click "Create a new bucket"
3. Bucket details:
   - **Name**: `project-images`
   - **Public bucket**: ✅ Checked
   - **File size limit**: 50MB
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`
4. Click "Create bucket"

### Set Storage Policies

Go to **Storage** → **Policies** and create these policies:

**For the `project-images` bucket:**

1. **Policy 1 - Public Read Access**:
   ```sql
   CREATE POLICY "Public Access" ON storage.objects 
   FOR SELECT USING (bucket_id = 'project-images');
   ```

2. **Policy 2 - Allow Uploads** (if you want authentication):
   ```sql
   CREATE POLICY "Allow uploads" ON storage.objects 
   FOR INSERT WITH CHECK (bucket_id = 'project-images');
   ```

3. **Policy 3 - Allow Deletes** (if you want authentication):
   ```sql
   CREATE POLICY "Allow deletes" ON storage.objects 
   FOR DELETE USING (bucket_id = 'project-images');
   ```

## 6. Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/portfolio-manager`
3. Log in with your password
4. Try adding a project with images
5. Check if the project appears on your main page

## 7. Database Schema Overview

Your `projects` table includes:

- `id` (UUID, Primary Key)
- `title` (String, Required)
- `description` (Text, Required)
- `category` (Enum: 'Residential', 'Commercial', 'Holiday Homes')
- `type` (String, Required)
- `size` (String, Required)
- `location` (String, Required)
- `thumbnail` (String, Image URL)
- `pictures` (Array of Strings, Image URLs)
- `created_at` (Timestamp)
- `updated_at` (Timestamp, Auto-updated)

## 8. Security Considerations

### Row Level Security (RLS)

The setup includes RLS policies:
- **Public read access**: Anyone can view projects
- **Authenticated write access**: Only authenticated users can modify

### For Production:

1. **Change the default password** in your environment variables
2. **Implement proper authentication** (consider Supabase Auth)
3. **Set up proper RLS policies** based on your needs
4. **Enable database backups** in Supabase dashboard
5. **Monitor usage** to stay within limits

## 9. Deployment

### Environment Variables for Production:

Make sure to set these in your deployment platform (Vercel, Netlify, etc.):

```
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
PORTFOLIO_MANAGER_PASSWORD=your_secure_password
```

## 10. Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check your environment variables
2. **"Table doesn't exist"**: Make sure you ran the SQL schema
3. **"Storage bucket not found"**: Verify bucket creation and policies
4. **Images not loading**: Check storage policies and bucket settings

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test API endpoints directly
4. Check Supabase logs in dashboard

## 11. Optional: Supabase CLI Setup

For advanced users who want local development:

```bash
# Initialize Supabase in your project
supabase init

# Start local Supabase (requires Docker)
supabase start

# Generate TypeScript types
supabase gen types typescript --local > src/types/supabase.ts
```

## Support

If you encounter issues:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Visit the [Supabase community](https://github.com/supabase/supabase/discussions)
3. Check your project's Supabase dashboard logs

---

🎉 **You're all set!** Your portfolio should now be connected to Supabase with full database and image storage capabilities. 