const {
  AutoModerationRuleEventType,
  AutoModerationRuleTriggerType,
  AutoModerationActionType,
} = require("discord.js");

// Batas dari Discord untuk aturan AutoMod
const MAX_EXEMPT_CHANNELS = 50;
const MAX_EXEMPT_ROLES = 20;

function baseRule(name, triggerMetadata, customMessage, exemptRoles) {
  return {
    name,
    eventType: AutoModerationRuleEventType.MessageSend,
    triggerType: AutoModerationRuleTriggerType.Keyword,
    triggerMetadata,
    actions: [
      {
        type: AutoModerationActionType.BlockMessage,
        metadata: { customMessage },
      },
    ],
    enabled: true,
    exemptRoles: exemptRoles.slice(0, MAX_EXEMPT_ROLES),
  };
}

// 1. Blokir link, kecuali domain yang diizinkan.
function buildLinkRule(config) {
  return baseRule(
    "CIDRO • Blokir link",
    {
      keywordFilter: ["*http://*", "*https://*", "*www.*"],
      allowList: config.automod.allowedLinkDomains.map((d) => `*${d}*`),
    },
    "Link tersebut tidak diperbolehkan di server ini.",
    config.roles.admin
  );
}

// 2. Blokir heading Markdown (# sampai ######).
function buildHeadingRule(config) {
  return baseRule(
    "CIDRO • Blokir heading (#)",
    { regexPatterns: ["(?m)^ {0,3}#{1,6}[ \\t]+\\S"] },
    "Penggunaan format heading (#) tidak diperbolehkan di server ini.",
    config.roles.admin
  );
}

// 3. Anti-promosi. AutoMod tidak bisa dibatasi ke channel tertentu, jadi semua
// yang BUKAN kategori anti-promosi dikecualikan. Kategori lain dikecualikan
// sekaligus (satu entri = semua channel di dalamnya) supaya muat di batas 50.
// `channels` = [{ id, type, parentId }]; type 4 = kategori.
// Return { rule, exemptCount } atau { error }.
const CATEGORY = 4;

function collapseExemptions(channels, protectedCategoryIds) {
  const exempt = [];
  const categories = channels.filter((c) => c.type === CATEGORY);
  const categoryIds = new Set(categories.map((c) => c.id));
  const others = channels.filter((c) => c.type !== CATEGORY);

  for (const cat of categories) {
    if (protectedCategoryIds.has(cat.id)) continue;
    if (others.some((c) => c.parentId === cat.id)) exempt.push(cat.id);
  }
  // Channel tanpa kategori: dikecualikan satu per satu
  for (const c of others) {
    if (!c.parentId || !categoryIds.has(c.parentId)) exempt.push(c.id);
  }
  return exempt;
}

function buildPromoRule(config, channels, { serverWide = false } = {}) {
  const protectedCategories = new Set(config.automod.promoCategoryIds);
  const exemptChannels = serverWide ? [] : collapseExemptions(channels, protectedCategories);

  if (exemptChannels.length > MAX_EXEMPT_CHANNELS) {
    return {
      error:
        `Ada ${exemptChannels.length} entri yang harus dikecualikan, sedangkan AutoMod hanya bisa ${MAX_EXEMPT_CHANNELS}. ` +
        "Pindahkan channel tanpa kategori ke dalam sebuah kategori, lalu jalankan ulang.",
    };
  }

  const rule = baseRule(
    "CIDRO • Anti promosi",
    { keywordFilter: config.automod.promoKeywords },
    "Promosi atau jualan tidak diperbolehkan di server ini.",
    config.roles.admin
  );
  rule.exemptChannels = exemptChannels;
  return { rule, exemptCount: exemptChannels.length };
}

module.exports = { buildLinkRule, buildHeadingRule, buildPromoRule, MAX_EXEMPT_CHANNELS };
