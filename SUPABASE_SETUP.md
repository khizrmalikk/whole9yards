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

## 2.1. Set Up Vercel Blob (For Large File Uploads)

**Why use Vercel Blob?** Vercel Functions have a 4.5MB request body limit. For larger files (like high-resolution images), we use Vercel Blob with client-side uploads to bypass this limit. Files are uploaded directly from your browser to Vercel's blob storage.

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Blob** → **Create Store**
3. Choose a name for your blob store (e.g., `portfolio-images`)
4. Once created, go to the **Settings** tab
5. Copy the **BLOB_READ_WRITE_TOKEN** value

**Benefits:**
- No file size limits (up to 100MB on Pro plan)
- Faster uploads (direct to storage)
- Global CDN delivery
- Automatic image optimization

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Vercel Blob Configuration (for large file uploads)
BLOB_READ_WRITE_TOKEN=your_blob_token_here

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

## 5. ~~Set Up Image Storage~~ (No longer needed)

**Note:** We no longer use Supabase storage for images. All image uploads are handled via Vercel Blob for better performance and no size limits.

~~1. Go to **Storage** in your Supabase dashboard~~ (Skip this step)
~~2. Click "Create a new bucket"~~ (Skip this step)
~~3. Bucket details:~~
   ~~- **Name**: `project-images`~~
   ~~- **Public bucket**: ✅ Checked~~
   ~~- **File size limit**: 50MB~~
   ~~- **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`~~
~~4. Click "Create bucket"~~ (Skip this step)

### ~~Set Storage Policies~~ (No longer needed)

~~Go to **Storage** → **Policies** and create these policies:~~ (Skip this section)

~~**For the `project-images` bucket:**~~

~~1. **Policy 1 - Public Read Access**:~~
   ~~```sql~~
   ~~CREATE POLICY "Public Access" ON storage.objects~~
   ~~FOR SELECT USING (bucket_id = 'project-images');~~
   ~~```~~

~~2. **Policy 2 - Allow Uploads** (if you want authentication):~~
   ~~```sql~~
   ~~CREATE POLICY "Allow uploads" ON storage.objects~~
   ~~FOR INSERT WITH CHECK (bucket_id = 'project-images');~~
   ~~```~~

~~3. **Policy 3 - Allow Deletes** (if you want authentication):~~
   ~~```sql~~
   ~~CREATE POLICY "Allow deletes" ON storage.objects~~
   ~~FOR DELETE USING (bucket_id = 'project-images');~~
   ~~```~~

## 6. Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit your portfolio manager at `http://localhost:3000/portfolio-manager`

3. Try creating a test project with images to verify everything works

## 7. Troubleshooting

### Common Issues:

1. **Connection errors**: Check your environment variables are correct
2. **Upload errors**: Ensure your Vercel Blob token is properly set
3. **Database errors**: Verify the schema was applied correctly

### Getting Help:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit the [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)

---

🎉 **You're all set!** Your portfolio should now be connected to Supabase with full database and image storage capabilities. 

## 📈 Image Performance Optimizations

We've implemented several performance optimizations to ensure your images load quickly:

### 🚀 **Client-Side Image Compression**
- **Before upload:** Images are automatically compressed to max 1MB
- **Resolution limit:** 1920px maximum width/height  
- **Format conversion:** All images converted to JPEG for better compression
- **Quality setting:** 80% quality for optimal balance

### 🖼️ **Next.js Image Optimization**
- **Modern formats:** Automatic WebP/AVIF conversion
- **Responsive images:** Multiple sizes generated automatically
- **Lazy loading:** Images load only when needed
- **Blur placeholders:** Smooth loading experience
- **Priority loading:** Critical images load first

### ⚡ **Performance Features**
- **CDN delivery:** Global content delivery network
- **30-day caching:** Reduced load times for repeat visitors
- **Smart sizing:** Responsive images for all devices
- **Progressive loading:** Better perceived performance

### 📊 **Expected Results**
- **90% smaller files:** 10MB images → ~1MB after compression
- **50% faster loading:** Optimized delivery and caching
- **Better UX:** Blur placeholders and progressive loading
- **SEO benefits:** Faster page speeds improve rankings

**Before optimization:** Large 5-10MB images with slow loading
**After optimization:** ~1MB compressed images with instant perceived loading

All these optimizations happen automatically - no additional configuration needed! 