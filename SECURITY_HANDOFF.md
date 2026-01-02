# 🛡️ SECURITY HANDOFF PROTOCOL: CLASSIFIED TRANSFER

**To:** System Administrator / Command Authority
**Subject:** Transfer of Control & Security Sanitization

This document outlines the procedure to transfer full ownership of the **ShipMove TA Tracker** system from the developer to the Naval Administration. Following these steps ensures the original developer retains **ZERO access** to the operational system.

---

## 🛑 Phase 1: Establish Secure Infrastructure
*Do not use the developer's existing Supabase or Vercel accounts. You must create your own.*

1.  **Create a Supabase Account**: Go to [supabase.com](https://supabase.com) and create a new organization/project using an official email.
2.  **Create a Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up.
3.  **Source Code Custody**:
    *   **Option A (GitHub Transfer)**: Ask the developer to "Transfer Ownership" of the repository to your GitHub account.
    *   **Option B (Air-Gapped)**: Download the source code as a `.zip` file and upload it to your own secure repository.

---

## 🔑 Phase 2: Database Initialization
*This sets up the database structure on YOUR secure instance.*

1.  Log in to your **New Supabase Dashboard**.
2.  Go to the **SQL Editor**.
3.  Copy the content from `supabase/MASTER_FIX_SCHEMA.sql` (provided in the source code).
4.  **Run** the script. This creates all tables (Soldiers, Movements, Audit Logs) and security policies.

---

## 👤 Phase 3: Claiming Command Authority
*Create the Master Admin account without developer assistance.*

1.  In your Supabase Dashboard, go to **Authentication** -> **Users**.
2.  Click **Add User** -> **Create New User**.
3.  Enter your official email and a strong password.
4.  Go back to the **SQL Editor** and run this command:
    ```sql
    UPDATE public.profiles
    SET role = 'admin'
    WHERE email = 'your-official-email@navy.mil'; -- Replace with the email you just created
    ```
5.  **Audit**: Check the `public.profiles` table to confirm your role is `admin`.

---

## 🔐 Phase 4: Rotating Security Keys
*This is the most critical step. It prevents external access.*

The system uses three keys to verify identity. You must replace the developer's keys with your own.

1.  In Supabase: **Project Settings** -> **API**.
2.  Copy these three values:
    *   Project URL
    *   `anon` public key
    *   `service_role` secret key (⚠️ **TOP SECRET**: Never share this)

3.  In Vercel (Deployment):
    *   Go to **Settings** -> **Environment Variables**.
    *   **Delete** any existing variables.
    *   Add your **NEW** values:
        *   `NEXT_PUBLIC_SUPABASE_URL`: (Your new Project URL)
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Your new `anon` key)
        *   `SUPABASE_SERVICE_ROLE_KEY`: (Your new `service_role` key)

4.  **Redeploy**: Click **Deployments** -> **Redeploy**.

---

## ✅ Phase 5: Verification (The "Kill Switch")
*Confirming separation.*

1.  Change your Supabase Database Password in **Settings** -> **Database** -> **Connection Pooling**.
2.  Go to **Authentication** -> **Policies** (RLS). Ensure all tables have "Enable Row Level Security" CHECKED.
3.  The developer now has **NO** access to:
    *   Your user data (Soldiers/Movements).
    *   Your deployment.
    *   Your admin logs.

**System is now Classified and Secure.**
