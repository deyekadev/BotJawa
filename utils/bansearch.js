function getAllowedRoleIds() {
  return (process.env.BANSEARCH_ROLE_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function isAllowedRole(interaction) {
  const allowedRoleIds = getAllowedRoleIds();
  if (!allowedRoleIds.length) return false;

  // discord.js interaction.member may contain a GuildMemberRoleManager
  // or the raw API role ID array.
  const roles = interaction.member?.roles;

  if (Array.isArray(roles)) {
    return allowedRoleIds.some((roleId) => roles.includes(roleId));
  }

  if (roles?.cache) {
    return allowedRoleIds.some((roleId) => roles.cache.has(roleId));
  }

  return false;
}

function getMessageText(message) {
  const parts = [];
  if (message.content) parts.push(message.content);

  for (const embed of message.embeds || []) {
    if (embed.title) parts.push(embed.title);
    if (embed.description) parts.push(embed.description);
    for (const field of embed.fields || []) {
      parts.push(`${field.name}: ${field.value}`);
    }
  }

  return parts.join("\n");
}

function parseBanRecord(message) {
  const text = getMessageText(message);
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  // Format from the supplied Discord screenshots:
  // ;timeban username 30d reason...
  // ;globalban username reason...
  const commandLine = lines.find((line) => /^;?\s*(timeban|globalban)\b/i.test(line));

  if (commandLine) {
    const match = commandLine.match(
      /^;?\s*(timeban|globalban)\s+([A-Za-z0-9_]{3,20})(?:\s+(\d+\s*[smhdwMy]?))?(?:\s+([\s\S]*))?$/i
    );

    if (match) {
      const banType = match[1].toUpperCase();
      const username = match[2];
      const possibleDuration = (match[3] || "").replace(/\s+/g, "");
      const reason = (match[4] || "").trim();
      const hasDuration = /^\d+[smhdwMy]$/i.test(possibleDuration);

      return {
        username,
        banType,
        duration: banType === "GLOBALBAN"
          ? "Permanent"
          : (hasDuration ? possibleDuration : "Not specified"),
        reason: banType === "TIMEBAN" && !hasDuration
          ? [possibleDuration, reason].filter(Boolean).join(" ").trim() || "Not specified"
          : reason || (banType === "GLOBALBAN" ? "Permanent ban" : "Not specified"),
        admin:
          message.member?.displayName ||
          message.author?.globalName ||
          message.author?.username ||
          "Unknown",
        date: message.createdAt
          ? message.createdAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
          : "",
        messageUrl: message.url,
        createdAt: message.createdAt,
      };
    }
  }

  // Backward-compatible parser for labeled text/embed records.
  const getLabel = (labels) => {
    const escaped = labels.map((label) =>
      label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    const regex = new RegExp(
      `(?:^|\\n|\\|)\\s*(?:${escaped.join("|")})\\s*[:=：-]\\s*([^\\n|]+)`,
      "i"
    );
    const found = text.match(regex);
    return found ? found[1].trim() : "";
  };

  const username = getLabel(["Roblox Username", "Username", "USN", "Player", "User"]);
  if (!username) return null;

  return {
    username,
    banType: getLabel(["Ban Type", "Type"]) || "Not specified",
    duration: getLabel(["Duration", "Time", "Durasi"]) || "Not specified",
    reason: getLabel(["Ban Reason", "Reason", "Alasan"]) || "Not specified",
    admin:
      getLabel(["Admin", "Banned By", "Moderator", "Staff"]) ||
      message.member?.displayName ||
      message.author?.username ||
      "Unknown",
    date:
      getLabel(["Ban Date", "Date", "Tanggal"]) ||
      (message.createdAt
        ? message.createdAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
        : ""),
    messageUrl: message.url,
    createdAt: message.createdAt,
  };
}

async function findBanRecord(channel, searchedUsername) {
  const maxScan = Math.max(
    100,
    Number.parseInt(process.env.BANLIST_MAX_SCAN || "5000", 10) || 5000
  );

  const target = searchedUsername.toLocaleLowerCase("en-US");
  let before;
  let scanned = 0;
  let newestMatch = null;

  while (scanned < maxScan) {
    const batch = await channel.messages.fetch({
      limit: Math.min(100, maxScan - scanned),
      ...(before ? { before } : {}),
    });

    if (!batch.size) break;

    const messages = [...batch.values()].sort(
      (a, b) => b.createdTimestamp - a.createdTimestamp
    );

    for (const message of messages) {
      const record = parseBanRecord(message);
      if (
        record &&
        record.username.toLocaleLowerCase("en-US") === target &&
        (!newestMatch || record.createdAt > newestMatch.createdAt)
      ) {
        newestMatch = record;
      }
    }

    scanned += batch.size;
    before = messages[messages.length - 1].id;

    if (batch.size < 100) break;
  }

  return { record: newestMatch, scanned };
}

module.exports = { isAllowedRole, parseBanRecord, findBanRecord };
