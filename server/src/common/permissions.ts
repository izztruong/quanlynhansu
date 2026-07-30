const ADMIN_SCOPES = ['CMS', 'HRM Chủ'];

export function isAdminScope(accessScopes: string[]) {
  return accessScopes.some((scope) => ADMIN_SCOPES.includes(scope));
}
