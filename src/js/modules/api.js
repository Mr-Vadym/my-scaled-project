// Іменований експорт — бо може бути не один
export async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Помилка завантаження:", err);
    return null;
  }
}
