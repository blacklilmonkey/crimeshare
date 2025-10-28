# Step-by-Step: Connect CrimeShare to Cloudflare

Since your domain is already connected to Cloudflare, follow these steps:

## Step 1: Deploy Your Server to Render.com (Easiest)

### 1.1 Create Account & Connect Repository
1. Go to https://render.com and sign up (free account works)
2. Click "New +" → "Web Service"
3. Connect your GitHub/GitLab account
   - OR use "Public Git Repository" and paste your repo URL
   - OR use "Manual Deploy" and upload your code as a ZIP

### 1.2 Configure Your Service
Fill in these settings:
- **Name:** crimeshare (or whatever you want)
- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Plan:** Free (or choose paid for better performance)
- **Auto-Deploy:** Yes

### 1.3 Deploy
Click "Create Web Service" and wait for deployment (~3-5 minutes)

### 1.4 Get Your Server URL
Once deployed, you'll get a URL like:
`https://crimeshare-xxxx.onrender.com`

**IMPORTANT:** Copy this URL! You'll need it for DNS.

---

## Step 2: Add DNS Record in Cloudflare

### 2.1 Go to Cloudflare Dashboard
1. Login to https://dash.cloudflare.com
2. Select your domain

### 2.2 Add CNAME Record
1. Go to **DNS** → **Records**
2. Click **Add record**
3. Fill in:
   - **Type:** CNAME
   - **Name:** @ (or www, or files - choose what you want)
   - **Target:** `your-app-name.onrender.com` (the URL from Render)
   - **Proxy status:** 🟠 Proxied (orange cloud)
4. Click **Save**

### 2.3 (Optional) Add WWW Subdomain
Add another CNAME record:
- **Type:** CNAME
- **Name:** www
- **Target:** `your-app-name.onrender.com`
- **Proxy status:** 🟠 Proxied

---

## Step 3: Configure SSL/TLS

### 3.1 Enable SSL
1. Go to **SSL/TLS** in Cloudflare dashboard
2. Set encryption mode to **"Full (strict)"**
3. Cloudflare will handle SSL automatically!

---

## Step 4: Update Your Render Service (Important!)

### 4.1 Add Environment Variable
In your Render.com dashboard:
1. Go to your service
2. Click **Environment**
3. Add new variable:
   - **Key:** `PORT`
   - **Value:** `10000`

Render uses port 10000 for web services.

### 4.2 Update server.js
Update your server to use the PORT from environment:

```javascript
const PORT = process.env.PORT || 3000;
```

(This is already in your server.js, so you're good!)

---

## Step 5: Wait & Test

1. **Wait for DNS Propagation** (5-30 minutes)
2. Visit your domain: `https://yourdomain.com`
3. Test file upload
4. Test download links

---

## Alternative: Use VPS (DigitalOcean) if You Want

### Option B: VPS Hosting
1. Sign up at https://www.digitalocean.com
2. Create a Droplet:
   - Ubuntu 22.04
   - $6/month plan
3. SSH into your server
4. Upload your files via SFTP
5. Run these commands:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pm2
cd /path/to/your/project
npm install
pm2 start server.js
pm2 save
pm2 startup
```

6. Then in Cloudflare, add an **A Record** instead of CNAME:
   - **Type:** A
   - **Name:** @
   - **IPv4:** Your droplet's IP address
   - **Proxy:** 🟠 Proxied

---

## Troubleshooting

### DNS Not Working?
- Clear your browser cache
- Try in incognito mode
- Check if DNS is "Proxied" (orange cloud)
- Wait up to 24 hours for full propagation

### 502/503 Errors?
- Check Render.com logs
- Make sure server is running
- Verify PORT environment variable

### Files Not Uploading?
- Check if disk space is available
- Verify uploads/ directory exists
- Check server logs in Render dashboard

---

## Your Website Will Be At:
- Main site: `https://yourdomain.com`
- Upload page: `https://yourdomain.com`
- Download page: `https://yourdomain.com/download?id=file-code`

---

## Need Help?

Follow this exact order:
1. ✅ Deploy to Render.com (or VPS)
2. ✅ Get server URL/IP
3. ✅ Add DNS record in Cloudflare (CNAME for Render, A for VPS)
4. ✅ Set SSL to "Full (strict)"
5. ✅ Wait 5-30 minutes
6. ✅ Visit your domain!

**That's it!** Your site will be live and protected by Cloudflare! 🎉

