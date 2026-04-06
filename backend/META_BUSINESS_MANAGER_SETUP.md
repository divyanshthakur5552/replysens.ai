# How to Add Phone Number to Meta Business Manager

## Step-by-Step Guide

### 1. Access Meta Business Manager
- Go to: https://business.facebook.com
- Log in with your Facebook account
- Select your business account

### 2. Navigate to WhatsApp Manager
- In the left sidebar, click **"WhatsApp"**
- Or go directly to: https://business.facebook.com/wa/manage/

### 3. Find Your WhatsApp Business Account
- You should see your existing WhatsApp Business account
- Click on it to open WhatsApp Manager

### 4. Add Phone Number to Allowed List

#### Method A: Phone Numbers Section
1. Click **"Phone Numbers"** in the left menu
2. Find your business phone number (15551922233)
3. Click **"Manage"** or **"Settings"**
4. Look for **"Recipient Phone Numbers"** or **"Test Recipients"**
5. Click **"Add Phone Number"**
6. Enter: **+91 8352986476**
7. Click **"Add"** or **"Save"**

#### Method B: App Settings
1. Click **"App"** in the left menu
2. Select your WhatsApp Business app
3. Go to **"WhatsApp"** → **"Configuration"**
4. Find **"Recipient Phone Numbers"** section
5. Click **"Add Recipient"**
6. Enter: **+91 8352986476**
7. Click **"Add"**

### 5. Alternative: Add via API Settings
1. Go to **"API Setup"** or **"Getting Started"**
2. Look for **"Add a phone number to test with"**
3. Enter: **+91 8352986476**
4. Click **"Add Phone Number"**

### 6. Verify Addition
- The number should appear in your recipient list
- Status should show as "Added" or "Active"
- May take 1-2 minutes to activate

## Screenshots Guide

### What to Look For:
```
WhatsApp Manager Dashboard
├── Phone Numbers
│   ├── Your Business Number: +1 555 192 2233
│   └── Recipient Numbers: [Add +91 8352986476 here]
├── API Setup
│   └── Test Recipients: [Add numbers here]
└── Configuration
    └── Allowed Recipients: [Add numbers here]
```

## Common Locations for Adding Recipients:

1. **WhatsApp Manager** → **Phone Numbers** → **Recipients**
2. **WhatsApp Manager** → **API Setup** → **Test Numbers**  
3. **WhatsApp Manager** → **Configuration** → **Allowed Numbers**
4. **WhatsApp Manager** → **Getting Started** → **Add Test Number**

## If You Can't Find the Option:

### Check Account Status:
- Ensure your business is verified
- Check if account is in "Development" mode
- Some accounts have different UI layouts

### Alternative Method:
1. Go to **Facebook Developers** (developers.facebook.com)
2. Find your WhatsApp Business app
3. Go to **WhatsApp** → **Configuration**
4. Add recipient numbers there

## Troubleshooting:

### "Phone number already registered" Error:
- Choose **"Migrate"** to convert personal WhatsApp to business
- Or **"Disconnect"** and wait 3 minutes
- Then try adding again

### Can't Find Recipient Section:
- Your account might be in "Live" mode (no restrictions)
- Try sending a test message directly
- Contact Meta support if needed

## After Adding the Number:

1. **Wait 1-2 minutes** for activation
2. **Test sending a message** using your script
3. **Check WhatsApp** on +91 8352986476
4. **Message should be delivered** successfully

## Quick Test Command:
```bash
node send-hi.js
```

The message should now reach +91 8352986476!