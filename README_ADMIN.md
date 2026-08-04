# LRL Admin Setup

The website files are complete, but the login cannot become active until a free Supabase project is connected.

## What is already included

- Admin Login button
- Secure email/password login page
- Protected admin page
- Team creation, editing and deletion
- Driver standings creation, editing and deletion
- Automatic public website updates
- Discord server widget
- Static fallback data when Supabase is unavailable
- Row Level Security rules

The admin password is **not** stored in the GitHub files.

## 1. Create a Supabase project

Create a new free project and wait until it is ready.

## 2. Create the database

Open:

```text
SQL Editor -> New query
```

Copy the complete contents of:

```text
SETUP_SUPABASE.sql
```

Run it once.

## 3. Create the admin user

Open:

```text
Authentication -> Users -> Add user
```

Use your own admin email address and the LRL admin password that was chosen earlier.

After the user exists, return to the SQL Editor and run:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'YOUR_ADMIN_EMAIL';
```

Replace `YOUR_ADMIN_EMAIL` with the exact email you used.

## 4. Connect the website

In Supabase, open the project API settings and copy:

- Project URL
- Public anon/publishable key

Open:

```text
supabase-config.js
```

Replace the two placeholder values:

```javascript
window.LRL_SUPABASE_CONFIG = {
  projectUrl: "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE",
  anonKey: "PASTE_YOUR_SUPABASE_ANON_KEY_HERE"
};
```

The public anon/publishable key is intended for browser use with Row Level Security. Never place a secret/service-role key in GitHub.

## 5. Upload the update to GitHub

Upload all files from this package to the root of the existing website repository and replace older files when asked.

New files include:

```text
admin-login.html
admin-login.js
admin.html
admin.js
admin.css
supabase-config.js
SETUP_SUPABASE.sql
README_ADMIN.md
```

## 6. Discord widget

The website uses this official widget:

```text
https://discord.com/widget?id=1533580785733337290&theme=dark
```

The server widget must be enabled in the Discord server settings. When disabled, the website section remains visible but the Discord panel will not load correctly.

## Admin workflow

1. Open the public website.
2. Click `Admin`.
3. Sign in with the admin email and password.
4. Add or edit teams and standings.
5. Refresh the public site to see the updates.
