export const normalizeRole = (role) => String(role || '').toUpperCase().replace(/_/g, '');

export const isSuperAdminRole = (role) => [
  'SUPERADMIN',
  'SUPER_ADMIN'
].includes(normalizeRole(role));

export const isGlobalAdminRole = (role) => [
  'GLOBALADMIN',
  'GLOBAL_ADMIN'
].includes(normalizeRole(role));

export const isRegionalAdminRole = (role) => [
  'REGIONALADMIN',
  'REGIONAL_ADMIN'
].includes(normalizeRole(role));

export const isPractitionerRole = (role) => ['PRACTITIONER', 'OPERATOR', 'USER'].includes(normalizeRole(role));

export const isNationalAdminRole = (role) => isSuperAdminRole(role) || isGlobalAdminRole(role);
