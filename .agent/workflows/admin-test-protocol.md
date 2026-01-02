---
description: Tactical Testing Workflow for Admin Users
---

# ⚓ Admin Tactical Testing Workflow

This workflow guide outlines the steps for an **Administrator** to verify the core operational capabilities of the **ShipMove TA Tracker**.

## Phase 1: Identity & Authorization Setup
1.  **Verify Level**: Navigate to `/profile` and ensure your "Command Authority" is listed as **Admin**.
2.  **User Commissioning**: Go to **Admin → Users**.
    *   Click **"Recruit Personnel"**.
    *   Create a dummy user with the **Data Entry** role.
    *   **Verify**: Ensure the credentials (email/password) are displayed and can be copied.
    *   **Registry Check**: Ensure the new user appears in the Personnel Management table with the "Invited" status.

## Phase 2: Personnel Registry Management
1.  **Add Soldier**: Navigate to the **Soldiers** registry.
    *   Click **"Add Soldier"**.
    *   Enter sample data (e.g., SN: `BN-1024`, Rank: `Lt Commander`, Unit: `BNS ISSA KHAN`).
    *   **Verify**: The soldier should appear in the searchable table immediately.
2.  **Search Test**: Use the search bar at the top of the Soldier table to filter by Service Number.

## Phase 3: Tactical Movement Lifecycle
1.  **Initiate Movement**: Go to **Movements** and click **"New Movement"**.
    *   Select the soldier you just created.
    *   Set a destination (e.g., Dhaka to Chittagong).
    *   Set the **Allowance (TA)** amount (e.g., `৳5000.00`).
    *   Submit the record.
2.  **Review Queue**: Navigate to the **Review** page.
    *   Locate the "Pending" movement you just created.
    *   Click **"Approve"**.
    *   **Verify**: The status should change to a green "Approved" badge, and the ৳ amount should be added to the Dashboard's "Monthly Spend".

## Phase 4: Interface & Intelligence
1.  **Command Menu**: Press `Ctrl + K`.
    *   Type "Soldiers" and press Enter to jump to the page.
    *   Type "Settings" and press Enter.
2.  **Theme Protocol**: Go to **Settings** or use the topbar toggle.
    *   Switch to **Light Mode** and then back to **Tactical Dark**.
    *   **Verify**: Colors and Taka symbols (৳) should remain consistent and readable.

## Phase 5: Audit & Security
1.  **Movement Details**: In the **Movements** log, click the arrow next to a record.
    *   Open the detail drawer.
    *   **Verify**: The "Allowance" shows the correct ৳ symbol.
    *   Check the **Audit Timeline** at the bottom of the drawer to see your approval action logged.

---
**Status: testing_protocol_initialized**
**Priority: Alpha-One**
