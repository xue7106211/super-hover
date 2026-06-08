export type Album = {
  id: string;
  title: string;
  artist: string;
  year: number | "—";
  cover: string;
};

const TITLES = [
  "Selected Ambient Works 85-92",
  "Music For Airports",
  "Ambient 4 (On Land)",
  "Slave Ambient",
  "The Plateaux Of Mirror",
  "Day Of Radiance",
  "Pop Ambient",
  "Ambient Dub Volume I",
];

const ARTISTS = [
  "Aphex Twin",
  "Brian Eno",
  "The War On Drugs",
  "Harold Budd",
  "Laraaji",
  "Moby",
  "Various",
];

const YEARS: (number | "—")[] = [1979, 1982, 1992, 1994, 2011, 2018, 2024, "—"];

// 精选的 Unsplash 直链封面（音乐 / 黑胶 / 氛围质感）。
// 用 images.unsplash.com CDN，?w/h/fit/q 参数让图被裁成正方形缩略图。
const COVERS = [
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
  "https://images.unsplash.com/photo-1458560871784-56d23406c091",
  "https://images.unsplash.com/photo-1507838153414-b4b713384a76",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea",
  "https://images.unsplash.com/photo-1462965326201-d02e4f455804",
].map((url) => `${url}?w=400&h=400&fit=crop&q=80`);

// Generate a long, scrollable list so the scroll-while-hovering effect is obvious.
export const ALBUMS: Album[] = Array.from({ length: 80 }, (_, i) => ({
  id: String(i + 1).padStart(3, "0"),
  title: TITLES[i % TITLES.length],
  artist: ARTISTS[i % ARTISTS.length],
  year: YEARS[i % YEARS.length],
  // 按索引循环取一张真实封面
  cover: COVERS[i % COVERS.length],
}));
