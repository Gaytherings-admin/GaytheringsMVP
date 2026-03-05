# Email Setup Guide for Booking Form

The booking form sends emails to the following recipients:
- expert.techie31@gmail.com
- vahan@gaytherings.com
- matthew@gaytherings.com

## Configuration Options

### Option 1: Gmail SMTP (Recommended for Development)

**⚠️ IMPORTANT: You MUST use an App Password, NOT your regular Gmail password!**

#### Step-by-Step Setup:

1. **Enable 2-Factor Authentication**:
   - Go to https://myaccount.google.com/security
   - Under "Signing in to Google", click "2-Step Verification"
   - Follow the prompts to enable it

2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" as the app
   - Select "Other (Custom name)" as device, enter "Gatherings CMS"
   - Click "Generate"
   - **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)
   - **Remove spaces** when using it (should be: `abcdefghijklmnop`)

3. **Add to `.env.local`** (in project root):
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcdefghijklmnop
   SMTP_FROM=your-email@gmail.com
   ```
   
   **Example:**
   ```env
   SMTP_USER=john.doe@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop
   SMTP_FROM=john.doe@gmail.com
   ```
   (Note: Remove spaces from the App Password - it should be 16 characters with no spaces)

4. **Restart your dev server** after adding environment variables:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

#### Common Mistakes:
- ❌ Using your regular Gmail password → Will get "Invalid login" error
- ❌ Not enabling 2FA first → App passwords won't be available
- ❌ Including spaces in App Password → Should be 16 characters, no spaces
- ❌ Not restarting dev server → Environment variables won't load

### Option 2: Custom SMTP Server

Add these environment variables to `.env.local`:

```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
```

### Option 3: Email Service Providers

For production, consider using:
- **Resend** (recommended for Next.js)
- **SendGrid**
- **Mailgun**
- **AWS SES**

## Testing

1. Fill out the booking form
2. Submit the form
3. Check the recipient email inboxes for the booking request

## Troubleshooting

### Emails not sending?

1. **Check environment variables**: Make sure `.env.local` has the correct SMTP credentials
2. **Check server logs**: Look for error messages in the terminal
3. **Gmail App Password**: Ensure you're using an App Password, not your regular password
4. **Firewall/Network**: Some networks block SMTP ports

### Common Issues

- **"Invalid login"**: Check your SMTP credentials
- **"Connection timeout"**: Check SMTP_HOST and SMTP_PORT
- **"Authentication failed"**: For Gmail, use App Password, not regular password

## Production Deployment

For production (Netlify, Vercel, etc.):

1. Add environment variables in your hosting platform's dashboard
2. Use a dedicated email service (Resend, SendGrid) for better deliverability
3. Set up SPF/DKIM records for your domain

