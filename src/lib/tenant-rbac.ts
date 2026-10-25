export const TENANT_PERMISSIONS = [
  "organization.read",
  "organization.settings.manage",
  "organization.close",
  "members.read",
  "members.invite",
  "members.manage",
  "roles.read",
  "roles.manage",
  "branches.read",
  "branches.manage",
  "catalog.read",
  "catalog.create",
  "catalog.update",
  "catalog.archive",
  "inventory.read",
  "inventory.adjust",
  "inventory.transfer",
  "orders.read",
  "orders.create",
  "orders.update",
  "orders.cancel",
  "customers.read",
  "customers.create",
  "customers.update",
  "customers.export",
  "payments.read",
  "payments.collect",
  "payments.refund",
  "reports.read",
  "reports.export",
  "billing.read",
  "billing.manage",
  "audit.read",
] as const;

export type TenantPermission = (typeof TENANT_PERMISSIONS)[number];

export const BUILT_IN_TENANT_ROLES = [
  "owner",
  "administrator",
  "manager",
  "inventory_manager",
  "cashier",
  "fulfillment",
  "finance",
  "analyst",
  "auditor",
] as const;

export type BuiltInTenantRole = (typeof BUILT_IN_TENANT_ROLES)[number];

const readOnlyPermissions: TenantPermission[] = [
  "organization.read",
  "members.read",
  "roles.read",
  "branches.read",
  "catalog.read",
  "inventory.read",
  "orders.read",
  "customers.read",
  "payments.read",
  "reports.read",
  "audit.read",
];

const administratorPermissions = TENANT_PERMISSIONS.filter(
  (permission) => permission !== "organization.close",
);

export const DEFAULT_TENANT_ROLE_PERMISSIONS: Record<BuiltInTenantRole, readonly TenantPermission[]> = {
  owner: TENANT_PERMISSIONS,
  administrator: administratorPermissions,
  manager: [
    "organization.read",
    "members.read",
    "branches.read",
    "catalog.read",
    "catalog.create",
    "catalog.update",
    "inventory.read",
    "inventory.adjust",
    "inventory.transfer",
    "orders.read",
    "orders.create",
    "orders.update",
    "orders.cancel",
    "customers.read",
    "customers.create",
    "customers.update",
    "payments.read",
    "reports.read",
    "audit.read",
  ],
  inventory_manager: [
    "branches.read",
    "catalog.read",
    "inventory.read",
    "inventory.adjust",
    "inventory.transfer",
    "reports.read",
  ],
  cashier: [
    "branches.read",
    "catalog.read",
    "orders.read",
    "orders.create",
    "customers.read",
    "customers.create",
    "payments.collect",
  ],
  fulfillment: [
    "branches.read",
    "inventory.read",
    "orders.read",
    "orders.update",
  ],
  finance: [
    "organization.read",
    "payments.read",
    "payments.refund",
    "reports.read",
    "reports.export",
    "billing.read",
    "audit.read",
  ],
  analyst: [
    "organization.read",
    "branches.read",
    "catalog.read",
    "inventory.read",
    "orders.read",
    "customers.read",
    "payments.read",
    "reports.read",
    "reports.export",
  ],
  auditor: readOnlyPermissions,
};

export const HIGH_RISK_TENANT_PERMISSIONS: ReadonlySet<TenantPermission> = new Set([
  "organization.close",
  "members.manage",
  "roles.manage",
  "branches.manage",
  "catalog.archive",
  "inventory.adjust",
  "inventory.transfer",
  "orders.cancel",
  "customers.export",
  "payments.refund",
  "reports.export",
  "billing.manage",
]);

export function permissionsForTenantRoles(roles: readonly string[]): ReadonlySet<TenantPermission> {
  const permissions = new Set<TenantPermission>();
  for (const role of roles) {
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_TENANT_ROLE_PERMISSIONS, role)) continue;
    for (const permission of DEFAULT_TENANT_ROLE_PERMISSIONS[role as BuiltInTenantRole]) {
      permissions.add(permission);
    }
  }
  return permissions;
}

export function hasTenantPermission(
  roles: readonly string[],
  permission: TenantPermission,
): boolean {
  return permissionsForTenantRoles(roles).has(permission);
}
