# Local Development Setup Guide

## ✅ Project Setup Complete

The project has been cloned and dependencies have been installed.

## 🔑 Next Steps: Environment Variables

You need to create a `.env.local` file in the root directory with the following variables:

### Required: Clerk Authentication

The app requires Clerk authentication to work. You need to:

1. **Create a free Clerk account** at https://dashboard.clerk.com
2. **Create a new application** in the Clerk dashboard
3. **Copy your API keys** and add them to `.env.local`:

```bash
# Create .env.local file
touch .env.local
```

Add these variables to `.env.local`:

```env
# Clerk Authentication (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Optional: Override Webflow Configuration

The project already has default Webflow credentials in `config.ts`. If you want to use your own:

```env
# Webflow API Configuration (Optional)
NEXT_PUBLIC_AUTH_TOKEN=your_webflow_api_token_here
NEXT_PUBLIC_COLLECTION_ID=your_collection_id_here
NEXT_PUBLIC_CATEGORY_COLLECTION_ID=your_category_collection_id_here
NEXT_PUBLIC_COMMUNITY_COLLECTION_ID=your_community_collection_id_here
NEXT_PUBLIC_LOCATION_COLLECTION_ID=your_location_collection_id_here
NEXT_PUBLIC_USER_COLLECTION_ID=your_user_collection_id_here
NEXT_PUBLIC_SITE_ID=your_webflow_site_id_here
```

### Optional: ImgBB API Key

For image uploads, you can get a free API key at https://api.imgbb.com/:

```env
IMGBB_API_KEY=your_imgbb_api_key_here
```

### Optional: Email Configuration (for Booking Form)

The booking form sends emails to recipients. To enable email sending, add SMTP credentials:

```env
# For Gmail (recommended for development)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# OR for custom SMTP
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
```

**Note**: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password (not your regular password)
3. Use that App Password in `SMTP_PASS`

See `EMAIL_SETUP.md` for detailed instructions.

## 🚀 Running the Application

Once you've set up your `.env.local` file with Clerk credentials:

```bash
npm run dev
```

The application will be available at http://localhost:3000

**Note:** You'll be redirected to sign-in first since all routes are protected by authentication.

## 📚 Additional Documentation

- See `README.md` for full project documentation
- See `NETLIFY_ENV_SETUP.md` for deployment configuration
- See `PROJECT_STRUCTURE.md` for project architecture

