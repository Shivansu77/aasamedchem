# Admin User List Fix

## Problem

The admin dashboard showed a `Total Accounts` card, but clicking it sent the admin back to `/admin`. There was no admin-facing user list or user detail page, so admins could not inspect registered users from the dashboard.

## Solution

- Added `/admin/users` to show all registered users.
- Changed the dashboard `Total Accounts` card to link to `/admin/users`.
- Added a `Users` item to the admin sidebar.
- Made each user row open `/admin/users/[id]`.
- Added the user detail page with profile information, quotation count, quotation value, and quotation history.

## Files Changed

- `src/app/admin/page.js`
- `src/components/admin/AdminSidebar.js`
- `src/app/admin/users/page.js`
- `src/app/admin/users/[id]/page.js`
- `explain.md`

## How It Works

The user list page queries the `users` table and left joins `quotations` so admins can see each account with quotation count, total quotation value, and latest quotation activity. The detail page validates the route id, loads that user, and then loads their quotation history with product names and totals.

Admins now click `Total Accounts` on the dashboard or `Users` in the sidebar to see users, then click a user row or `View details` to inspect one account.
