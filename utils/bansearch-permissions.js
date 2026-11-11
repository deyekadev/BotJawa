function isAllowedRole(interaction) {
  const allowedRoleIds = (process.env.BANSEARCH_ROLE_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!allowedRoleIds.length) return false;

  const roles = interaction.member?.roles;

  if (Array.isArray(roles)) {
    return allowedRoleIds.some((roleId) => roles.includes(roleId));
  }

  if (roles?.cache) {
    return allowedRoleIds.some((roleId) => roles.cache.has(roleId));
  }

  return false;
}

module.exports = { isAllowedRole };
