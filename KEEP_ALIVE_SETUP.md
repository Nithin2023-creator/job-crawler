# 🌙 Keep Backend Awake Setup Guide

Because Render's free tier sleeps after 15 minutes of inactivity, your internal scheduler stops working. To fix this, we need an external service to "ping" your backend every 14 minutes.

## ✅ Solution: Use cron-job.org (Free)

1.  **Register/Login** at [https://cron-job.org/en/](https://cron-job.org/en/) (It's free).
2.  Click **"Create Cronjob"** (or "Cronjobs" -> "Create cronjob").
3.  **Fill in the details:**
    *   **Title:** `Keep Job Crawler Awake`
    *   **URL:** `https://<YOUR-RENDER-APP-NAME>.onrender.com/api/health`
        *   *(Replace `<YOUR-RENDER-APP-NAME>` with your actual deployment URL)*
    *   **Execution Schedule:** Select **"Every 15 minutes"** (actually, choose **Every 14 minutes** or "Every 10 minutes" to be safe).
4.  **Notifications:** You can disable "Execution failed" emails if you don't want spam, or keep them to know if your server crashes.
5.  Click **"Create Cronjob"**.

### 🎯 Result
*   This service will hit your `/api/health` endpoint 24/7.
*   Your backend will never go to "sleep".
*   Your internal scheduler (running at 2:00 AM) will now trigger correctly!
*   **Bonus:** We modified the server logs so these "health pings" won't clutter your console.

---

## ⚠️ Alternative: Trigger via Cron directly

If you don't want to keep the server awake 24/7, you can set the cron job to just *trigger* the hunt at 2:00 AM.

*   **URL:** `https://<YOUR-RENDER-APP-NAME>.onrender.com/api/hunt/trigger`
*   **Method:** Change `GET` to **`POST`**.
*   **Schedule:** User-defined (e.g., "At 02:00 every day").

*Note: The "Keep Awake" method is generally more reliable for other background tasks too.*
