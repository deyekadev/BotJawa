const { MessageFlags } = require("discord.js");
const config = require("../config");

// ID role milik pemakai slash command (mendukung dua bentuk data dari Discord).
function getRoleIds(interaction) {
  const roles = interaction.member?.roles;
  if (!roles) return [];
  if (Array.isArray(roles)) return roles;
  return [...(roles.cache?.keys?.() || [])];
}

function isAdmin(interaction) {
  if (!interaction.inGuild()) return false;
  return getRoleIds(interaction).some((id) => config.roles.admin.includes(id));
}

// Balas penolakan (hanya terlihat oleh pemakai) dan kembalikan false kalau bukan admin.
async function requireAdmin(interaction) {
  if (isAdmin(interaction)) return true;
  await interaction.reply({
    content: "⛔ Kamu tidak punya izin untuk memakai command ini.",
    flags: MessageFlags.Ephemeral,
  });
  return false;
}

module.exports = { getRoleIds, isAdmin, requireAdmin };
