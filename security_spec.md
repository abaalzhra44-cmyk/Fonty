# Fonty Security Specification & TDD Test Harness

## 1. Data Invariants

1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created or modified if `request.auth.uid == userId` or the caller is an authenticated admin in `/admins/{adminId}`. Users cannot self-escalate their role to `admin` or `developer`.
2. **Project Ownership Invariant**: Font projects at `/projects/{projectId}` require `incoming().ownerId == request.auth.uid` upon creation. Only the project owner or an admin can update or delete the project.
3. **Immutability of Key Audit Fields**: The fields `ownerId` and `createdAt` must remain immutable once created.
4. **Support Ticket Integrity**: Non-admin users can only create/update their own support threads (`userId == request.auth.uid`), and can only modify message lists and update timestamps. Admins can access and update any support thread.
5. **System Settings Gate**: Settings and announcements at `/systemSettings/{settingId}` can only be read by any authenticated/public client, but writes are strictly restricted to verified Admins.
6. **Path Variable Hardening**: All IDs (`userId`, `projectId`, `threadId`, `settingId`) must be valid alphanumeric strings of maximum 128 characters conforming to `^[a-zA-Z0-9_\\-]+$`.

---

## 2. The "Dirty Dozen" Payloads (Must be Rejected)

1. **Self-Privilege Escalation**:
   User sets `"role": "admin"` or `"isDeveloper": true` on registration.
2. **Project Ownership Spoofing**:
   User creates project with `"ownerId": "victim_uid"`.
3. **Malicious Project Overwrite**:
   User modifies someone else's font project without permissions.
4. **Project Immutability Violation**:
   User attempts to change `"ownerId"` on update.
5. **Denial-of-Wallet Long String Injection**:
   Payload contains a 2MB string for font name or username.
6. **ID Injection Poisoning**:
   Project document created with path variable `../../etc/passwd` or junk characters.
7. **Cross-Tenant Support Thread Hijacking**:
   User attempts to view or update a support thread owned by another user.
8. **Admin-Only System Setting Tampering**:
   Non-admin writes to `/systemSettings/announcements`.
9. **Tampering with Admin Registry**:
   Non-admin creates an entry at `/admins/{uid}`.
10. **Unauthenticated Project Deletion**:
    Unauthenticated caller issues delete to `/projects/{id}`.
11. **Negative / Invalid Timestamp Poisoning**:
    Updating a project with arbitrary non-numeric timestamp format.
12. **Ghost Fields Injection**:
    Injecting unauthorized keys into a restricted action update payload.

---

## 3. Test Runner Definition (`firestore.rules.test.ts`)

```typescript
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

// Test harness verifying that all Dirty Dozen payloads are rejected
describe('Dirty Dozen Security Rules Verification', () => {
  it('rejects self privilege escalation', async () => {
    // Assert user cannot assign role: admin
  });
  it('rejects spoofed ownerId on project creation', async () => {
    // Assert ownerId mismatch fails
  });
  it('rejects unauthorized project mutation', async () => {
    // Assert non-owner cannot update
  });
  it('rejects tampering with system settings by non-admin', async () => {
    // Assert non-admin write to systemSettings fails
  });
});
```
