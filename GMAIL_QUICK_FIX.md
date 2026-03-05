# 🔧 Quick Fix: Gmail Authentication Error

## Error You're Seeing:
```
535-5.7.8 Username and Password not accepted
Invalid login: BadCredentials
```

## ✅ Solution (5 minutes):

### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the setup (you'll need your phone)

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" 
3. Select "Other (Custom name)" → Type "Gatherings CMS"
4. Click "Generate"
5. **Copy the 16-character password** (example: `abcd efgh ijkl mnop`)

### Step 3: Update .env.local
Open `.env.local` in your project root and add/update:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=your-email@gmail.com
```

**Important:**
- Use the **App Password** (16 characters), NOT your regular Gmail password
- Remove spaces from the App Password
- Use the same email in SMTP_USER and SMTP_FROM

### Step 4: Restart Server
```bash
# Stop server (Ctrl+C) then:
npm run dev
```

### Step 5: Test Again
Submit the booking form - it should work now!

---

## ❌ Common Mistakes:

1. **Using regular password** → Must use App Password
2. **Not enabling 2FA first** → App passwords won't be available
3. **Including spaces** → Remove spaces from App Password
4. **Not restarting server** → Environment variables won't load

---

## Still Not Working?

1. **Check .env.local exists** in project root (not in app/ folder)
2. **Verify App Password** - should be exactly 16 characters, no spaces
3. **Check email format** - must be full email: `user@gmail.com`
4. **Restart dev server** - environment variables only load on startup

Need more help? See `EMAIL_SETUP.md` for detailed instructions.

