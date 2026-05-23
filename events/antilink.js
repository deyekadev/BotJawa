module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Abaikan pesan dari bot atau DM
        if (message.author.bot || !message.guild) return;

        // Regex untuk mendeteksi link
        const linkRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

        // Cek apakah pesan mengandung link
        if (linkRegex.test(message.content)) {
            
            // ==========================================
            // 1. PENGATURAN WHITELIST ROLE & BYPASS
            // ==========================================
            // Daftar ID Role yang kebal dari sistem anti-link
            const whitelistedRoles = [
                '1452199873989443717', 
                '1463866960436789411', 
                '1452202000593719346'
            ]; 
            
            // Cek apakah user memiliki salah satu role di atas
            const hasWhitelistedRole = message.member.roles.cache.some(role => whitelistedRoles.includes(role.id));
            
            // Jika user adalah Admin/Moderator atau punya Role Whitelist, izinkan
            if (message.member.permissions.has('ManageMessages') || hasWhitelistedRole) return;


            // ==========================================
            // 2. PENGATURAN WHITELIST LINK (SUDAH DISINKRONKAN)
            // ==========================================
            // Daftar kata kunci link yang diizinkan untuk dikirim oleh member biasa
            const whitelistedLinks = [
                'tiktok.com',      // Mengizinkan vt.tiktok.com, www.tiktok.com, dll.
                'roblox.com'       // Mengizinkan roblox.com/share, roblox.com/games, dll.
            ]; 
            
            // Ambil semua link dari pesan yang dikirim
            // Reset regex index karena .test() sempat mengubah index internal regex
            linkRegex.lastIndex = 0; 
            const linksInMessage = message.content.match(linkRegex);
            
            if (!linksInMessage) return;

            // Cek apakah ada link di pesan yang TIDAK ada di daftar whitelist
            const containsBadLink = linksInMessage.some(link => {
                return !whitelistedLinks.some(whiteLink => link.toLowerCase().includes(whiteLink.toLowerCase()));
            });

            // Jika mengandung link ilegal, hapus dan beri peringatan
            if (containsBadLink) {
                try {
                    await message.delete();
                    
                    const warning = await message.channel.send(`⚠️ ${message.author}, Kamu tidak diizinkan mengirim sembarang link di server Cidro Janji! Hanya link TikTok dan Roblox yang diperbolehkan.`);
                    
                    // Hapus pesan peringatan setelah 5 detik agar chat rapi
                    setTimeout(() => {
                        warning.delete().catch(() => {});
                    }, 5000);
                    
                } catch (error) {
                    console.error("Gagal menghapus pesan link:", error);
                }
            }
        }
    }
};