const config = require("../config");

// True kalau member punya role Sobat Cidro DAN New Mem sekaligus.
function needsCleanup(member) {
  const { newMember, sobatCidro } = config.roles;
  const roles = member?.roles?.cache;
  if (!roles) return false;
  return roles.has(newMember) && roles.has(sobatCidro);
}

// Hapus role New Mem hanya jika member juga punya Sobat Cidro.
// Return true kalau role berhasil dihapus, false kalau tidak perlu.
async function cleanupMember(member, reason = "Sudah punya Sobat Cidro") {
  if (!needsCleanup(member)) return false;
  await member.roles.remove(config.roles.newMember, reason);
  return true;
}

module.exports = { needsCleanup, cleanupMember };
