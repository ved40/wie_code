# Email Configuration Guide

## Current Setup
The application is now configured to use **Ethereal Email** (a test SMTP service) for development and testing.

### What is Ethereal Email?
- Free test email service
- No real emails are sent
- Perfect for development and testing
- No setup required - works immediately
- Safe to use with any test data

---

## How to Test Email Feature Now
1. Register a new patient
2. The email will be "sent" successfully (no errors)
3. Check console for confirmation message: "Registration email sent to: [patient-email]"

---

## Switching to Gmail for Production

If you want to use a real Gmail account to send emails, follow these steps:

### Step 1: Enable Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google will generate a 16-character password
4. Copy this password (e.g., `nthb jskg wovj jfue`)

### Step 2: Update Configuration in index.js
Replace the email configuration section with:

```javascript
// Email configuration for Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your-email@gmail.com",  // Your Gmail address
        pass: "nthb jskg wovj jfue"     // Your App Password (from step 1)
    }
});
```

### Step 3: Update Sender Email
In the `sendRegistrationEmail` function, change:
```javascript
from: "bridie.marvin@ethereal.email",
```
to:
```javascript
from: "your-email@gmail.com",  // Your Gmail address
```

### Step 4: Restart the Application
After making changes, restart your Node.js server:
```bash
node index.js
```

---

## Troubleshooting

### Error: ENETUNREACH
**Cause:** Network cannot connect to email server
**Solutions:**
1. Check internet connection
2. Check if firewall is blocking port 465 or 587
3. Use Ethereal Email (current setup) for testing

### Error: Invalid login credentials
**Cause:** Wrong Gmail password or app-specific password not generated
**Solution:** Regenerate App Password from myaccount.google.com/apppasswords

### Email not sending but no error
**Cause:** Might be using Ethereal (test service)
**Solution:** Check console logs - Ethereal doesn't send real emails, just simulates

---

## Current Credentials for Reference

### Ethereal Test Account (Current)
- Email: bridie.marvin@ethereal.email
- Password: mXMYq8r6wNgT4jJkP2xH7n
- This account should work immediately

### For Gmail (When You Switch)
- You'll need your own Gmail account
- Generate an App Password as described above

---

## Quick Start to Enable Real Emails

Edit `index.js` around line 15:

```javascript
// Change from this:
const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
        user: "bridie.marvin@ethereal.email",
        pass: "mXMYq8r6wNgT4jJkP2xH7n"
    }
});

// To this (uncomment and fill in):
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: "your-email@gmail.com",
//         pass: "your-app-specific-password"
//     }
// });
```

Then restart the application.
