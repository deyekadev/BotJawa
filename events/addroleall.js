const ROLE_ID = "1463882981050548284"; // Ganti sesuai role target
const BATCH_SIZE = 50;
const DELAY = 800; // 0,8 detik per member
const INTERVAL = 120000; // 2 menit

let running = false;

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message, client) {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === "autorolebatch") {
      if (running) return message.channel.send("⚠️ Auto batch sedang berjalan...");

      running = true;
      message.channel.send("⏳ Mulai auto assign role batch 50 member tiap 2 menit...");

      const role = message.guild.roles.cache.get(ROLE_ID);
      if (!role) return message.channel.send("❌ Role tidak ditemukan");

      const intervalId = setInterval(async () => {
        let allMembers;
        try {
          allMembers = await message.guild.members.fetch({ force: true });
        } catch (err) {
          console.log("❌ Fetch member gagal:", err);
          message.channel.send("❌ Fetch member gagal, hentikan batch.");
          clearInterval(intervalId);
          running = false;
          return;
        }

        const targetMembers = allMembers.filter(
          m => !m.user.bot && !m.roles.cache.has(role.id)
        );

        if (targetMembers.size === 0) {
          message.channel.send("✅ Semua member sudah mendapatkan role!");
          clearInterval(intervalId);
          running = false;
          return;
        }

        const batch = Array.from(targetMembers.values()).slice(0, BATCH_SIZE);
        let count = 0;

        for (const member of batch) {
          try {
            await member.roles.add(role);
            count++;
            await new Promise(r => setTimeout(r, DELAY));
          } catch (err) {
            console.log(`❌ Gagal assign role ke ${member.user.tag}: ${err}`);
          }
        }

        message.channel.send(`✅ Batch selesai: ${count} member diberikan role`);
        console.log(`✅ Batch selesai, ${count} member diberikan role`);
      }, INTERVAL);
    }
  }
};