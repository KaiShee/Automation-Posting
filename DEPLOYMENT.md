# 🚀 QR Social Share - Deployment Guide

## 📋 Prerequisites
- ✅ Vercel account created (username: kaishee)
- ✅ Supabase account created
- ✅ Project: qr-social-share

## 🗄️ Step 1: Setup Supabase Database

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Click on your project: `cybwthrumtimvyqxduxw`

2. **Run SQL Setup**
   - Go to **SQL Editor** (left sidebar)
   - Copy the contents of `supabase-setup.sql`
   - Paste and click **Run**
   - Wait for all functions to be created

3. **Verify Tables**
   - Go to **Table Editor** (left sidebar)
   - You should see `campaigns` and `events` tables

## 🌐 Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Project Root**
   ```bash
   cd "C:\Users\USER\Automation Posting Social Media App"
   vercel --prod
   ```

4. **Follow the prompts:**
   - Set up and deploy: **Y**
   - Which scope: Select your account
   - Link to existing project: **N**
   - Project name: **qr-social-share**
   - Directory: **./** (current directory)
   - Override settings: **N**

### Option B: Using Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click **New Project**

2. **Import Git Repository**
   - Connect your GitHub account
   - Select your repository
   - Or drag and drop your project folder

3. **Configure Project**
   - Project Name: `qr-social-share`
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`

## 🔧 Step 3: Configure Environment Variables

1. **In Vercel Dashboard**
   - Go to your project settings
   - Click **Environment Variables**
   - Add these variables:

   ```
   SUPABASE_URL=https://cybwthrumtimvyqxduxw.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5Ynd0aHJ1bXRpbXZ5cXhkdXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NDc3NjEsImV4cCI6MjA3MTUyMzc2MX0.VF3TvAqbNCpk23CDT8ndN2rCrrzq-g5Q270a6RitwT0
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5Ynd0aHJ1bXRpbXZ5cXhkdXh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk0Nzc2MSwiZXhwIjoyMDcxNTIzNzYxfQ.xEhop811zsxgq0ZHs1AZ2MZ4FJ1_uzZwfiX-IkwKp7E
   ```

2. **Redeploy**
   - Go to **Deployments** tab
   - Click **Redeploy** on your latest deployment

## 🎯 Step 4: Test Your Live App

1. **Your Live URLs:**
   - Frontend: `https://qr-social-share.vercel.app`
   - API: `https://qr-social-share.vercel.app/api/health`
   - Demo Campaign: `https://qr-social-share.vercel.app/?c=demo&u=scan-demo`

2. **Test from Phone:**
   - Open the live URL on your phone
   - Scan the QR code
   - Test the share functionality

## 🔄 Step 5: Update Custom Domain (Optional)

1. **In Vercel Dashboard**
   - Go to **Settings** → **Domains**
   - Add your custom domain (e.g., `share.yourbrand.my`)
   - Follow DNS configuration instructions

2. **Update QR Codes**
   - Your app will automatically use the custom domain

## 📱 Features After Deployment

✅ **Global Access**: Works from anywhere in the world  
✅ **Real Database**: Supabase stores campaigns and events  
✅ **Analytics**: Track all QR scans and social shares  
✅ **Custom Domains**: Use your own domain  
✅ **HTTPS**: Secure connections everywhere  
✅ **CDN**: Fast loading worldwide  

## 🚨 Troubleshooting

### Database Connection Issues
- Check Supabase project is active
- Verify environment variables in Vercel
- Check Supabase logs for errors

### Build Failures
- Ensure all dependencies are installed
- Check TypeScript compilation
- Verify build commands in package.json

### API Not Working
- Check Vercel function logs
- Verify CORS settings
- Test database connectivity

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase database logs
3. Verify environment variables
4. Test API endpoints individually

## 🎉 You're Done!

Your QR Social Share app is now:
- 🌍 **Live on the internet**
- 📱 **Accessible from any phone**
- 🗄️ **Connected to a real database**
- 📊 **Ready for production use**

**Next Steps:**
- Create real campaigns in Supabase
- Customize the UI for your brand
- Set up custom domains
- Monitor analytics in Supabase
