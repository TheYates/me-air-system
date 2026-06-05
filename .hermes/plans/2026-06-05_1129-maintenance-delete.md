# Add maintenance record delete support

## Goal
Let users delete maintenance records from the system so the maintenance page no longer lacks delete functionality.

## Current context / assumptions
- `app/maintenance/page.tsx` is a client page that already supports listing, filtering, sorting, status changes, and edit.
- `lib/api.ts` exposes `api.maintenance.delete(id)` calling `DELETE /api/maintenance/:id`.
- `app/maintenance/[id]/page.tsx` is the detail view; it currently has status updates, notes, checklist, parts, and photos, but no delete flow.
- Other parts of the app already have delete patterns (`equipment` pages), so reuse that UX.

## Proposed approach
- Add delete buttons to the maintenance list table in `app/maintenance/page.tsx`.
- Add a delete flow in `app/maintenance/[id]/page.tsx` as well.
- Use a confirmation dialog and invalidate existing `maintenance` queries on success.
- Keep unsafe mutation semantics explicit by making operators risky.

## Step-by-step plan
1. Add a delete confirmation dialog state in `app/maintenance/page.tsx`.
2. Add a delete button to each row's Actions column, alongside existing Eye/Start/Complete/Edit controls.
3. Implement a confirmation dialog that calls `api.maintenance.delete(id)`, shows success/error toast, and invalidates `maintenance` queries.
4. Repeat the same delete confirmation flow in `app/maintenance/[id]/page.tsx`, ideally near page header actions.
5. Verify delete UX and toast behavior manually by deleting a test record.

## Files likely to change
- `app/maintenance/page.tsx`
- `app/maintenance/[id]/page.tsx`

## Tests / validation
- Navigate to `/maintenance`, delete a record from the list, confirm it disappears and success toast appears.
- Navigate to a detail page, delete from there, confirm redirect back to `/maintenance` or removal from history.

## Risks, tradeoffs, and open questions
- There is no soft-delete fallback visible yet; confirm backend `DELETE /api/maintenance/:id` behavior before finalizing.
- No bulk delete requested now; keep scope limited to single-record delete unless you want me to add select/bulk actions too.
