const cacheState = {
  channelId: null,
  ready: false,
  loading: null,
  recordsByMessage: new Map(),
  recordsByUsername: new Map(),
  pendingMutations: [],
  scanned: 0,
  lastLoadedAt: null,
  error: null,
};

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

function collectEvidenceImages(message) {
  const urls = new Set();

  for (const attachment of message.attachments?.values?.() || []) {
    const contentType = attachment.contentType || "";
    const url = attachment.url || attachment.proxyURL;
    const looksLikeImage = contentType.startsWith("image/") ||
      /\.(png|jpe?g|gif|webp|bmp)(?:\?|$)/i.test(url || "");
    if (url && looksLikeImage) urls.add(url);
  }

  for (const embed of message.embeds || []) {
    const url = embed.image?.url || embed.thumbnail?.url;
    if (url) urls.add(url);
  }

  return [...urls].slice(0, 4);
}

function parseBanRecord(message) {
  const text = getMessageText(message);
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
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
        messageId: message.id,
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
        evidenceImages: collectEvidenceImages(message),
        createdTimestamp: message.createdTimestamp || Date.now(),
      };
    }
  }

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
    messageId: message.id,
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
    evidenceImages: collectEvidenceImages(message),
    createdTimestamp: message.createdTimestamp || Date.now(),
  };
}

function removeRecord(messageId) {
  const oldRecord = cacheState.recordsByMessage.get(messageId);
  if (!oldRecord) return;

  cacheState.recordsByMessage.delete(messageId);
  const key = oldRecord.username.toLocaleLowerCase("en-US");
  const bucket = cacheState.recordsByUsername.get(key);

  if (bucket) {
    bucket.delete(messageId);
    if (bucket.size === 0) cacheState.recordsByUsername.delete(key);
  }
}

function applyUpsert(message) {
  if (!message?.id) return;
  removeRecord(message.id);

  const record = parseBanRecord(message);
  if (!record) return;

  cacheState.recordsByMessage.set(message.id, record);
  const key = record.username.toLocaleLowerCase("en-US");
  if (!cacheState.recordsByUsername.has(key)) {
    cacheState.recordsByUsername.set(key, new Map());
  }
  cacheState.recordsByUsername.get(key).set(message.id, record);
}

function applyDelete(messageId) {
  if (messageId) removeRecord(messageId);
}

function queueOrApply(operation) {
  if (cacheState.loading) {
    cacheState.pendingMutations.push(operation);
    return;
  }
  if (operation.type === "delete") applyDelete(operation.messageId);
  else applyUpsert(operation.message);
}

function isSourceChannel(channelId) {
  return Boolean(
    channelId &&
    process.env.BANLIST_CHANNEL_ID &&
    channelId === process.env.BANLIST_CHANNEL_ID.trim()
  );
}

async function initializeBanCache(client, force = false) {
  const channelId = (process.env.BANLIST_CHANNEL_ID || "").trim();
  if (!channelId) throw new Error("BANLIST_CHANNEL_ID belum diatur di .env");

  if (!force && cacheState.ready && cacheState.channelId === channelId) {
    return getCacheStatus();
  }
  if (!force && cacheState.loading && cacheState.channelId === channelId) {
    return cacheState.loading;
  }

  cacheState.channelId = channelId;
  cacheState.ready = false;
  cacheState.error = null;
  cacheState.pendingMutations = [];

  cacheState.loading = (async () => {
    const channel =
      client.channels.cache.get(channelId) ||
      await client.channels.fetch(channelId);

    if (!channel?.isTextBased?.() || !channel.messages?.fetch) {
      throw new Error("Channel Ban List tidak ditemukan atau bukan text channel.");
    }

    const maxScan = Math.max(
      100,
      Number.parseInt(process.env.BANLIST_MAX_SCAN || "5000", 10) || 5000
    );

    const loadedByMessage = new Map();
    let before;
    let scanned = 0;

    console.log(`[BAN CACHE] Memuat maksimal ${maxScan} pesan dari #${channel.name || channelId}...`);

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
        if (record) loadedByMessage.set(message.id, record);
      }

      scanned += batch.size;
      before = messages[messages.length - 1].id;
      if (batch.size < 100) break;
    }

    cacheState.recordsByMessage = new Map();
    cacheState.recordsByUsername = new Map();

    for (const record of loadedByMessage.values()) {
      cacheState.recordsByMessage.set(record.messageId, record);
      const key = record.username.toLocaleLowerCase("en-US");
      if (!cacheState.recordsByUsername.has(key)) {
        cacheState.recordsByUsername.set(key, new Map());
      }
      cacheState.recordsByUsername.get(key).set(record.messageId, record);
    }

    cacheState.scanned = scanned;
    for (const operation of cacheState.pendingMutations) {
      if (operation.type === "delete") applyDelete(operation.messageId);
      else applyUpsert(operation.message);
    }

    cacheState.pendingMutations = [];
    cacheState.ready = true;
    cacheState.lastLoadedAt = new Date();
    cacheState.error = null;

    console.log(
      `[BAN CACHE] Selesai: ${cacheState.recordsByMessage.size} record dari ${scanned} pesan.`
    );
    return getCacheStatus();
  })();

  try {
    return await cacheState.loading;
  } catch (error) {
    cacheState.error = error;
    cacheState.ready = false;
    console.error("[BAN CACHE] Gagal memuat Ban List:", error);
    throw error;
  } finally {
    cacheState.loading = null;
  }
}

function getCacheStatus() {
  return {
    ready: cacheState.ready,
    scanned: cacheState.scanned,
    recordCount: cacheState.recordsByMessage.size,
    lastLoadedAt: cacheState.lastLoadedAt,
    error: cacheState.error,
  };
}

async function getCachedBanRecord(client, username) {
  if (!cacheState.ready) await initializeBanCache(client);

  const key = username.toLocaleLowerCase("en-US");
  const bucket = cacheState.recordsByUsername.get(key);

  if (!bucket?.size) {
    return {
      record: null,
      scanned: cacheState.scanned,
      recordCount: cacheState.recordsByMessage.size,
      cacheLoadedAt: cacheState.lastLoadedAt,
    };
  }

  let newest = null;
  for (const record of bucket.values()) {
    if (!newest || record.createdTimestamp > newest.createdTimestamp) newest = record;
  }

  return {
    record: newest,
    scanned: cacheState.scanned,
    recordCount: cacheState.recordsByMessage.size,
    cacheLoadedAt: cacheState.lastLoadedAt,
  };
}

function handleBanMessageCreate(message) {
  if (!isSourceChannel(message?.channelId)) return;
  queueOrApply({ type: "upsert", message });
}

async function handleBanMessageUpdate(_oldMessage, newMessage) {
  if (!isSourceChannel(newMessage?.channelId)) return;
  const message = newMessage.partial ? await newMessage.fetch().catch(() => null) : newMessage;
  if (message) queueOrApply({ type: "upsert", message });
}

function handleBanMessageDelete(message) {
  if (!isSourceChannel(message?.channelId)) return;
  queueOrApply({ type: "delete", messageId: message.id });
}

module.exports = {
  parseBanRecord,
  initializeBanCache,
  getCachedBanRecord,
  getCacheStatus,
  handleBanMessageCreate,
  handleBanMessageUpdate,
  handleBanMessageDelete,
};
