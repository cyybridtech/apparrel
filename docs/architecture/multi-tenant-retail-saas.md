# Multi-tenant retail SaaS foundation

## Product model

The application is evolving from a single Cyybrid storefront into a retail SaaS product. Each paying customer is an `organization` (tenant), with a type such as `retailer`, `supermarket`, or `mall`. An organization can operate multiple `branches` such as stores, kiosks, warehouses, or distribution centers. A global user identity can belong to more than one organization; the user's effective permissions come from active organization memberships, not from a global `users.role` value.

**Initial tenancy assumption:** a mall, supermarket, or retailer is one tenant with its own staff and branches. If a mall must host separately operated merchants with independent billing and data ownership, those merchants should become separate organizations in a later phase; do not give a mall administrator implicit access to another tenant's records.

## Identity and authorization

- `users` represents a person and their global authentication identity.
- `organization_memberships` ties a user to a tenant and records whether that membership is active, suspended, or left.
- One user may receive multiple roles inside the same tenant through `membership_role_grants`.
- `organization_roles` and `organization_role_permissions` implement tenant-customizable RBAC using only keys in `permission_catalog`.
- Branch reach is explicit: memberships default to `assigned_branches`; `membership_branch_access` grants specific locations. A role grant never expands a user's branch scope by itself.
- `platform_memberships` is separate from tenant roles. Platform support access must not be represented as an organization administrator role. Platform staff should require MFA; support access should be audited and, when implemented, time-limited and customer-authorized.
- Invitations store a hash of a random, one-time token, never the raw token. Sessions store token hashes and revocation/expiry metadata.
- The current Express API still uses in-memory data and its legacy global-role middleware. The new schema and role catalog are foundations only; tenant-aware persistence and authorization must be implemented before production use.

## Default tenant roles

The typed policy catalog in `src/lib/tenant-rbac.ts` defines these least-privilege starting roles:

| Role | Intended access |
| --- | --- |
| Owner | Full tenant administration, billing, role management, and tenant closure. |
| Administrator | Tenant operations and staff/role management; cannot close the tenant. |
| Manager | Day-to-day catalog, inventory, order, customer, and reporting operations. |
| Inventory manager | Catalog read plus stock adjustment and transfer. |
| Cashier | Create sales/orders, collect payments, and use customer basics; no refunds or staff administration. |
| Fulfillment | Read and update orders, with inventory read access. |
| Finance | Payment/refund and billing/report access, with audit visibility. |
| Analyst | Read-oriented operational and report access; no mutations. |
| Auditor | Narrow read access plus audit history; no exports or mutations by default. |

High-risk actions (refunds, role changes, inventory adjustments, exports, billing changes, tenant closure) have distinct permission keys for future approval flows and audit requirements. Built-in roles are defaults, not hard-coded authorization shortcuts; server code must resolve effective permissions from active membership grants on each request.

## Tenant data boundaries

Organization-owned products, customers, orders, payments, inventory, payouts, audit events, branches, subscriptions, and staff data must carry an organization identifier. Tenant queries must always include the authenticated organization scope. Never accept an authoritative `organizationId`, `role`, `branchId`, or permission list from an untrusted request body or from unsigned client storage.

The schema adds composite foreign keys for critical same-tenant relationships, including role-to-membership grants, branch access, product-to-inventory, order-to-customer/branch, order-item-to-product/order, and payment-to-order. These complement—not replace—server-side authorization. Inventory writes should update the balance and append an idempotent ledger movement in one transaction; concurrent sales must lock the balance and must not allow negative available stock.

## Schema additions in this change

The Drizzle schema now declares tenants, branches, platform memberships, a permission catalog, customizable tenant roles and grants, invitations, subscriptions/plans, tenant customer profiles, revocable session records, scoped audit records, branch-level inventory balances and ledger movements, and tenant-scoped payment/event records. Existing commerce records gain nullable organization/actor/location links so older rows can be preserved while they are mapped.

Legacy `users.role`, seller-linked fields, globally unique product slugs, and old variant stock remain for compatibility. They are not the final authorization or inventory model. Do not delete, backfill, or constrain those fields until the live schema and data have been inspected and the application has moved to the new model.

## Safe migration and rollout

No migration is generated or applied by this change. The sandbox has no TiDB credentials, and the existing database is considered live.

1. Obtain a verified backup and restore it to a separate staging database.
2. Read the actual live schema from metadata and compare it with the legacy Drizzle definitions. Do not assume the checked-in schema exactly matches production.
3. Prepare an additive expansion migration: create the new tables, then add nullable organization/branch/actor columns and compatible indexes/FKs to existing tables. Do not drop or rename legacy columns.
4. Create the initial Cyybrid tenant and a default branch only after the migration is reviewed; backfill legacy products, orders, members, and logs in bounded, repeatable batches. Preserve source IDs and record a reconciliation report.
5. Seed permission catalog entries and owner/admin/manager/cashier/inventory/fulfillment/finance/auditor role grants idempotently. Create active memberships for existing staff; do not infer privilege from old unverified client state.
6. Implement tenant-scoped repositories and API middleware. Derive tenant and branch scope from the authenticated membership, validate every write transactionally, and audit privileged changes.
7. Test cross-tenant isolation, branch scoping, role escalation, invitation replay/expiry, session revocation, duplicate payment webhooks, inventory concurrency, rollback, and data-count reconciliation on staging.
8. Only after those checks pass, progressively require tenant identifiers for new rows. Keep legacy columns until rollback and retention windows end.

The current production-startup guard and paused checkout remain in force. This schema work must not be treated as a production database migration or as permission to accept live orders.
