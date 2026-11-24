// Skrip SATU KALI: memasang aturan AutoMod pengganti antilink, anti-promosi, dan filter heading.
//
//   node scripts/setup-automod.js                 (bot ada di satu server)
//   node scripts/setup-automod.js <ID_SERVER>     (bot ada di banyak server)
//   tambahkan --semua-channel kalau anti-promosi mau berlaku di semua channel
//
// Bot harus punya izin "Manage Server". Aman dijalankan ulang: aturan dengan
// nama yang sama diperbarui, bukan digandakan.

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { Client, GatewayIntentBits, Events } = require("discord.js");
const config = require("../config");
const { buildLinkRule, buildHeadingRule, buildPromoRule } = require("../utils/automod-rules");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function upsert(guild, existing, options) {
  const found = existing.find((rule) => rule.name === options.name);
  if (found) {
    const { triggerType, ...editOptions } = options;
    await found.edit(editOptions);
    return "diperbarui";
  }
  await guild.autoModerationRules.create(options);
  return "dibuat";
}

async function run() {
  const args = process.argv.slice(2);
  const serverWide = args.includes("--semua-channel");
  const guildIdArg = args.find((a) => /^\d{15,25}$/.test(a));

  let guild;
  if (guildIdArg) {
    guild = client.guilds.cache.get(guildIdArg);
    if (!guild) throw new Error(`Bot tidak ada di server ${guildIdArg}.`);
  } else if (client.guilds.cache.size === 1) {
    guild = client.guilds.cache.first();
  } else {
    const list = client.guilds.cache.map((g) => `  ${g.id}  ${g.name}`).join("\n");
    throw new Error(`Bot ada di ${client.guilds.cache.size} server. Tambahkan ID servernya:\n${list}`);
  }

  console.log(`Server: ${guild.name} (${guild.id})`);

  const existing = await guild.autoModerationRules.fetch();
  const channels = await guild.channels.fetch();
  const channelList = channels
    .filter((c) => c && (c.type === 4 || c.isTextBased?.() || c.type === 15 || c.type === 16)) // kategori, teks, forum, media
    .map((c) => ({ id: c.id, type: c.type, parentId: c.parentId }));

  const results = [];
  const attempt = async (label, options) => {
    try {
      results.push(`✅ ${label}: ${await upsert(guild, existing, options)}`);
    } catch (err) {
      const hint = err.code === 50013 ? " (bot butuh izin Manage Server)" : "";
      results.push(`❌ ${label}: gagal - ${err.message}${hint}`);
    }
  };

  await attempt("Blokir link", buildLinkRule(config));
  await attempt("Blokir heading (#)", buildHeadingRule(config));

  const promo = buildPromoRule(config, channelList, { serverWide });
  if (promo.error) results.push(`⚠️ Anti promosi: dilewati. ${promo.error}`);
  else {
    await attempt("Anti promosi", promo.rule);
    console.log(`(anti promosi: ${promo.exemptCount} entri dikecualikan)`);
  }

  console.log("");
  console.log(results.join("\n"));
  console.log("");
  console.log("Cek hasilnya di: Server Settings → AutoMod.");
}

client.once(Events.ClientReady, async () => {
  try {
    await run();
  } catch (err) {
    console.error("GAGAL:", err.message);
    process.exitCode = 1;
  } finally {
    await client.destroy();
  }
});

client.login(process.env.TOKEN);
