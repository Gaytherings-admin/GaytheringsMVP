# 🔧 Quick Fix: Email Not Configured Error on Netlify

## Error Message
```
Email Not Configured
SMTP credentials not configured. Please add SMTP_USER and SMTP_PASS...
```

## ✅ Solution: Add SMTP Environment Variables to Netlify

### Step 1: Go to Netlify Dashboard
1. Visit: https://app.netlify.com
2. Select your site

### Step 2: Add Environment Variables
1. Go to **Site Settings** → **Environment Variables**
2. Click **"Add a variable"**

### Step 3: Add These 3 Variables

**Variable 1:**
```
Key: SMTP_USER
Value: expert.techie31@gmail.com
```

**Variable 2:**
```
Key: SMTP_PASS
Value: tlenfcilhpfnoqak
```

**Variable 3:**
```
Key: SMTP_FROM
Value: expert.techie31@gmail.com
```

### Step 4: Redeploy
After adding the variables:
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for deployment to complete

### Step 5: Test
1. Visit your live site
2. Click "Book a call"
3. Fill out the form
4. Submit - emails should now send successfully!

---

## ⚠️ Important Notes

- **Gmail App Password**: The `SMTP_PASS` value is a Gmail App Password (16 characters, no spaces)
- **Case Sensitive**: Variable names are case-sensitive - use exactly: `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- **No Spaces**: Make sure there are no spaces before or after the values
- **Redeploy Required**: You MUST trigger a new deploy after adding variables

---

## 🎯 Quick Copy-Paste for Netlify

If your Netlify UI supports bulk import:

```env
SMTP_USER=expert.techie31@gmail.com
SMTP_PASS=tlenfcilhpfnoqak
SMTP_FROM=expert.techie31@gmail.com
```

---

## ✅ Verification

After adding variables and redeploying:
- ✅ No more "Email Not Configured" error
- ✅ Booking form submits successfully
- ✅ Emails sent to: vahan@gaytherings.com (CC: matthew@gaytherings.com, expert.techie31@gmail.com)

---

## 🐛 Still Not Working?

1. **Check variable names** - Must be exactly: `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
2. **Check values** - No spaces, correct email and password
3. **Redeploy** - Variables only take effect after a new deploy
4. **Check deploy logs** - Look for any errors during build

---

**Need more help?** See `EMAIL_SETUP.md` for detailed email configuration instructions.

