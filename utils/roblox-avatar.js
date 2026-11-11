const avatarCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(8000),
    headers: {
      "User-Agent": "Discord-BanList-Search/1.0",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Roblox API HTTP ${response.status}`);
  }

  return response.json();
}

async function getRobloxAvatar(username) {
  const key = String(username || "").toLowerCase();
  if (!key) return null;

  const cached = avatarCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  try {
    const userData = await fetchJson("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false,
      }),
    });

    const user = userData?.data?.[0];
    if (!user?.id) {
      avatarCache.set(key, { value: null, expiresAt: Date.now() + 60_000 });
      return null;
    }

    const thumbData = await fetchJson(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${user.id}&size=420x420&format=Png&isCircular=false`
    );

    const avatarUrl = thumbData?.data?.[0]?.imageUrl || null;
    const value = {
      userId: user.id,
      username: user.name || username,
      displayName: user.displayName || user.name || username,
      profileUrl: `https://www.roblox.com/users/${user.id}/profile`,
      avatarUrl,
    };

    avatarCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  } catch (error) {
    console.warn(`[ROBLOX AVATAR] Gagal mengambil avatar ${username}:`, error.message);
    return null;
  }
}

module.exports = { getRobloxAvatar };
