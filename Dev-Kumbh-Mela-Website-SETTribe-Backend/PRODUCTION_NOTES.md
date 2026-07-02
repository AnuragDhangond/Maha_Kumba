# Production Deployment Notes

I have made several changes to the backend to fix the issues with images and products not loading in production. Below is a summary of the changes and some additional steps you might need to take.

## Changes Made

### 1. Fixed Product Visibility
*   **Issue:** Products were seeded with a `PENDING` moderation status, but the public API only returns `APPROVED` products.
*   **Fix:** Updated `ShopSeeder.java` to set products to `APPROVED` and `ACTIVE` by default.

### 2. Fixed Image URLs in Seed Data
*   **Issue:** Many seeded items (Products, Artisans, Heritage sites, etc.) had hardcoded `http://localhost:5173` URLs.
*   **Fix:** Removed the localhost prefix to use relative paths. This allows the frontend to resolve them correctly if they are part of its own assets.

### 3. Improved Authentication for Production
*   **Issue:** The backend originally only supported JWT tokens via HttpOnly cookies. On Render, if your frontend and backend are on different subdomains (e.g., `*-frontend.onrender.com` and `*-backend.onrender.com`), cookies cannot be shared because `onrender.com` is on the Public Suffix List.
*   **Fix:** 
    *   Updated `JwtRequestFilter.java` to also support the `Authorization: Bearer <token>` header.
    *   Updated `UserController.java` to return the `token` and `refreshToken` in the response body during login/refresh.
    *   Refactored all controllers to use `SecurityContextHolder` to get the current user, making them compatible with both cookie and header-based auth.

### 4. CORS and Security
*   **Issue:** Wildcard CORS origin with `AllowCredentials(true)` is often blocked by browsers.
*   **Fix:** Explicitly added `https://mahakumbh-website-frontend.onrender.com` to the allowed origins in `SecurityConfig.java`.

### 5. Robust File Serving
*   **Issue:** Serving uploaded files from a local directory can be tricky in containerized environments.
*   **Fix:** Updated `WebMvcConfig.java` to use URI-based resource locations and ensured the `uploads` directory is created if it doesn't exist.

## Important Note on Image Persistence (Render)

Render uses an ephemeral filesystem by default. Any images you upload to the `/uploads` folder will be **lost** whenever the service restarts (e.g., during a new deployment).

**Recommendations:**
1.  **Persistent Disk:** If you want to keep using local storage, you must attach a **Persistent Disk** to your Render service and mount it to the `/app/uploads` directory.
2.  **Cloud Storage:** For a more robust solution, consider using **Cloudinary** or **AWS S3** for image storage instead of the local filesystem.

## Troubleshooting
If products still don't show up, you may need to clear your production database and let the seeders run again, or manually run an update query:
```sql
UPDATE products SET moderation_status = 'APPROVED', is_active = true, status = 'ACTIVE';
```
