// Skrip diagnosa (hanya membaca, tidak mengubah apa pun):
//   node scripts/cek-automod.js [ID_SERVER]
// Menampilkan tiap kategori/channel + apakah aturan "CIDRO • ..." berlaku di sana.

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { Client, GatewayIntentBits, Events } = require("discord.js");
const config = require("../config");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function run() {
  const arg = process.argv.slice(2).find((a) => /^\d{15,25}$/.test(a));
  const guild = arg ? client.guilds.cache.get(arg) : client.guilds.cache.first();
  if (!guild) throw new Error("Server tidak ditemukan.");

  const rules = (await guild.autoModerationRules.fetch()).filter((r) => r.name.startsWith("CIDRO"));
  const channels = await guild.channels.fetch();
  const target = new Set(config.automod.categoryIds);

  console.log(`Server: ${guild.name}\n`);
  console.log("Kategori di config.automod.categoryIds:");
  for (const id of target) {
    const c = channels.get(id);
    console.log(`  ${id}  ${c ? c.name : "(TIDAK DITEMUKAN di server ini!)"}`);
  }

  const isExempt = (rule, ch) =>
    rule.exemptChannels.has(ch.id) || (ch.parentId && rule.exemptChannels.has(ch.parentId));

  console.log("\nStatus per channel (KENA = aturan berlaku, - = dikecualikan):");
  console.log("channel".padEnd(34) + rules.map((r) => r.name.replace("CIDRO • ", "").slice(0, 14).padEnd(16)).join(""));
  const cats = [...channels.values()].filter((c) => c && c.type === 4).sort((a, b) => a.rawPosition - b.rawPosition);
  const show = (ch, indent) => {
    const cells = rules.map((r) => (isExempt(r, ch) ? "-" : "KENA").padEnd(16)).join("");
    console.log((indent + ch.name).slice(0, 33).padEnd(34) + cells);
  };
  for (const cat of cats) {
    show(cat, "");
    for (const ch of [...channels.values()].filter((c) => c && c.parentId === cat.id && c.type !== 4))
      show(ch, "   ");
  }
  for (const ch of [...channels.values()].filter((c) => c && !c.parentId && c.type !== 4)) show(ch, "(tanpa kategori) ");
}

client.once(Events.ClientReady, async () => {
  try { await run(); } catch (e) { console.error("GAGAL:", e.message); process.exitCode = 1; }
  finally { await client.destroy(); }
});
client.login(process.env.TOKEN);
