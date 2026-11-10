import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import portfolio4 from "@/assets/portfolio-4.jpg";
import portfolio5 from "@/assets/portfolio-5.jpg";
import portfolio6 from "@/assets/portfolio-6.jpg";
import heroImg1 from "@/assets/hero-1.jpg";
import heroImg2 from "@/assets/hero-2.jpg";
import heroImg3 from "@/assets/hero-3.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatar4 from "@/assets/avatar-4.jpg";
import avatar5 from "@/assets/avatar-5.jpg";
import avatar6 from "@/assets/avatar-6.jpg";

export type Offer = {
  id: string;
  name: string;
  duration: string;
  price: number;
  popular?: boolean;
  includes: string[];
  serviceType?: "Photo" | "Vidéo" | "Photo & vidéo";
  photos?: number;
  videoCount?: number;
  delivery?: string;
};

export type Review = {
  name: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  reply?: string;
};

export type Equipment = {
  photo: string[];
  video: string[];
  accessories: string[];
};

export type Creator = {
  id: string;
  name: string;
  handle: string;
  role: "Photographer" | "Videographer" | "Photo & Video";
  city: string;
  radiusKm: number;
  price: number;
  rating: number;
  reviews: number;
  years: number;
  responseTime: string;
  shoots: number;
  tags: string[];
  categories: string[];
  cover: string;
  avatar: string;
  bio: string;
  portfolio: string[];
  offers: Offer[];
  reviewList: Review[];
  /** day numbers of the sample month that are already booked */
  bookedDays: number[];
  equipment?: Equipment;
};

const commonIncludes = ["Direction artistique incluse", "Retouches haute qualité", "Livraison sous 7 jours"];

export const creators: Creator[] = [
  {
    id: "1",
    name: "Sophie Laurent",
    handle: "@sophie.l",
    role: "Photographer",
    city: "Paris",
    radiusKm: 80,
    price: 480,
    rating: 4.9,
    reviews: 128,
    years: 6,
    responseTime: "~2h",
    shoots: 320,
    tags: ["Editorial", "Fashion", "Portrait"],
    categories: ["Editorial", "Brand"],
    cover: portfolio1,
    avatar: avatar1,
    bio: "Photographe éditoriale basée à Paris, je collabore avec des marques de mode et des magazines depuis plus de six ans. Mon travail explore la lumière naturelle, les portraits intimes et les mises en scène cinématiques.",
    portfolio: [portfolio1, heroImg1, portfolio4, portfolio2, heroImg2, portfolio3],
    offers: [
      { id: "portrait", name: "Portrait éditorial", duration: "2h shoot · 15 photos retouchées", price: 480, includes: commonIncludes },
      { id: "brand", name: "Brand campaign", duration: "Demi-journée · 40 photos · usage 1 an", price: 1200, popular: true, includes: commonIncludes },
      { id: "lookbook", name: "Lookbook complet", duration: "Journée · 80+ photos · 3 looks", price: 2400, includes: commonIncludes },
    ],
    reviewList: [
      { name: "Anna R.", avatar: avatar2, rating: 5, date: "Il y a 2 semaines", text: "Sophie a une vision incroyable. Les photos dépassent toutes nos attentes.", reply: "Merci Anna, c'était un plaisir de créer ces images ensemble." },
      { name: "Mike Travers", avatar: avatar4, rating: 5, date: "Il y a 1 mois", text: "Très professionnelle, livraison rapide. On a déjà rebooké." },
      { name: "Kate L.", avatar: avatar3, rating: 4, date: "Il y a 2 mois", text: "Super expérience, qualité top." },
    ],
    bookedDays: [16, 19, 20, 25],
    equipment: { photo: ["Sony A7 IV", "Sony 85mm f/1.4", "Sony 35mm f/1.4"], video: [], accessories: ["Flash Profoto", "Réflecteurs 5-en-1"] },
  },
  {
    id: "2",
    name: "Marcus Bell",
    handle: "@marcus.shoots",
    role: "Videographer",
    city: "Berlin",
    radiusKm: 120,
    price: 920,
    rating: 4.8,
    reviews: 94,
    years: 8,
    responseTime: "~4h",
    shoots: 210,
    tags: ["Music Video", "Cinematic", "Brand"],
    categories: ["Music Video", "Brand", "Documentary"],
    cover: portfolio2,
    avatar: avatar2,
    bio: "Réalisateur et chef opérateur à Berlin. Je tourne des clips musicaux et des films de marque à l'esthétique brute, contrastée, tournés en anamorphique.",
    portfolio: [portfolio2, heroImg2, portfolio5, portfolio1, heroImg3, portfolio6],
    offers: [
      { id: "teaser", name: "Teaser vertical", duration: "Demi-journée · 2 formats", price: 920, includes: ["Repérage inclus", "Étalonnage cinéma", "Livraison 5 jours"] },
      { id: "clip", name: "Clip musical", duration: "1 jour tournage · 1 jour montage", price: 2600, popular: true, includes: ["Équipe 3 personnes", "Étalonnage cinéma", "2 rounds de retours"] },
      { id: "brandfilm", name: "Brand film", duration: "2 jours · interviews + broll", price: 4200, includes: ["Scénarisation", "Sound design", "Sous-titres"] },
    ],
    reviewList: [
      { name: "Lena K.", avatar: avatar3, rating: 5, date: "Il y a 3 semaines", text: "Le rendu est ultra cinématographique, exactement notre moodboard." },
      { name: "Tom V.", avatar: avatar5, rating: 5, date: "Il y a 2 mois", text: "Équipe carrée, montage livré avant la deadline." },
    ],
    bookedDays: [14, 15, 22],
    equipment: { photo: [], video: ["Sony FX3", "Sony 24-70mm f/2.8", "DJI Ronin 4D"], accessories: ["Kit son Sennheiser", "Drone DJI Air 3"] },
  },
  {
    id: "3",
    name: "Camille Roux",
    handle: "@camille.studio",
    role: "Photographer",
    city: "Lyon",
    radiusKm: 150,
    price: 650,
    rating: 5.0,
    reviews: 211,
    years: 9,
    responseTime: "~1h",
    shoots: 480,
    tags: ["Wedding", "Couples", "Outdoor"],
    categories: ["Wedding"],
    cover: portfolio3,
    avatar: avatar3,
    bio: "Spécialisée mariage et couples, je photographie en lumière naturelle avec une approche documentaire, discrète et sensible.",
    portfolio: [portfolio3, portfolio6, heroImg3, portfolio1, portfolio5, heroImg1],
    offers: [
      { id: "engagement", name: "Séance couple", duration: "1h30 · 30 photos", price: 650, includes: commonIncludes },
      { id: "wedding", name: "Mariage journée", duration: "10h · 400+ photos · galerie privée", price: 2800, popular: true, includes: ["Repérage du lieu", "Galerie en ligne", "Album 30x30 offert"] },
      { id: "weekend", name: "Mariage week-end", duration: "2 jours · second photographe", price: 4600, includes: ["Second photographe", "Galerie en ligne", "Tirages fine art"] },
    ],
    reviewList: [
      { name: "Julie & Paul", avatar: avatar6, rating: 5, date: "Il y a 1 mois", text: "Camille a capté chaque émotion de la journée. Parfait." },
      { name: "Sarah D.", avatar: avatar1, rating: 5, date: "Il y a 3 mois", text: "Discrète, douce et un rendu magnifique." },
    ],
    bookedDays: [17, 18, 24],
    equipment: { photo: ["Canon R5", "Canon RF 50mm f/1.2", "Canon RF 70-200mm"], video: [], accessories: ["Flash Profoto A10", "Deuxième boîtier" ] },
  },
  {
    id: "4",
    name: "Kenji Asano",
    handle: "@kenji.frames",
    role: "Photo & Video",
    city: "Tokyo",
    radiusKm: 60,
    price: 780,
    rating: 4.9,
    reviews: 167,
    years: 7,
    responseTime: "~3h",
    shoots: 290,
    tags: ["Street", "Neon", "Fashion"],
    categories: ["Street", "Editorial"],
    cover: portfolio4,
    avatar: avatar4,
    bio: "Photographe et vidéaste à Tokyo. Je travaille les néons, la nuit urbaine et la mode de rue, en photo comme en vidéo.",
    portfolio: [portfolio4, heroImg2, portfolio2, portfolio5, heroImg1, portfolio3],
    offers: [
      { id: "street", name: "Street session", duration: "2h · 25 photos", price: 780, includes: commonIncludes },
      { id: "hybrid", name: "Pack photo + vidéo", duration: "Demi-journée · 30 photos + reel", price: 1600, popular: true, includes: ["Photo & vidéo", "Reel vertical 30s", "Étalonnage"] },
      { id: "campaign", name: "Campagne nocturne", duration: "Journée · repérages inclus", price: 3100, includes: ["Repérage 2 quartiers", "Assistant lumière", "Usage 1 an"] },
    ],
    reviewList: [
      { name: "Aya M.", avatar: avatar5, rating: 5, date: "Il y a 2 semaines", text: "Une signature visuelle unique, on adore le rendu néon.", reply: "Merci Aya, ravi que cette ambiance vous plaise !" },
      { name: "Chris B.", avatar: avatar2, rating: 5, date: "Il y a 1 mois", text: "Réactif, créatif, très bon anglais." },
    ],
    bookedDays: [15, 21, 26],
    equipment: { photo: ["Fujifilm X-T5", "Fujinon 23mm f/1.4"], video: ["Sony FX30", "DJI RS 3 Mini"], accessories: ["Lumières LED Aputure", "Micro Rode Wireless Pro"] },
  },
  {
    id: "5",
    name: "Elena Vargas",
    handle: "@elena.vargas",
    role: "Videographer",
    city: "Madrid",
    radiusKm: 200,
    price: 1100,
    rating: 4.7,
    reviews: 73,
    years: 10,
    responseTime: "~6h",
    shoots: 140,
    tags: ["Cinematic", "Documentary"],
    categories: ["Documentary", "Brand"],
    cover: portfolio5,
    avatar: avatar5,
    bio: "Documentariste basée à Madrid. Je raconte des histoires humaines, du repérage au montage final, avec une équipe légère.",
    portfolio: [portfolio5, heroImg3, portfolio2, portfolio6, heroImg2, portfolio1],
    offers: [
      { id: "interview", name: "Interview filmée", duration: "3h · 1 caméra · sous-titres", price: 1100, includes: ["Son pro", "Sous-titres", "Livraison 5 jours"] },
      { id: "doc", name: "Mini-documentaire", duration: "2 jours · 5-8 min", price: 3400, popular: true, includes: ["Recherche & écriture", "Musique licenciée", "Sound design"] },
      { id: "series", name: "Série 3 épisodes", duration: "5 jours · 3 x 6 min", price: 7200, includes: ["Direction éditoriale", "Équipe 4 personnes", "Deux rounds de retours"] },
    ],
    reviewList: [
      { name: "Marta G.", avatar: avatar3, rating: 5, date: "Il y a 1 mois", text: "Un vrai regard d'auteure, le film est bouleversant." },
      { name: "Hugo P.", avatar: avatar4, rating: 4, date: "Il y a 4 mois", text: "Excellent résultat, planning un peu serré." },
    ],
    bookedDays: [14, 20, 27],
    equipment: { photo: [], video: ["Blackmagic Pocket 6K Pro", "Sigma Art 18-35mm", "Blackmagic Video Assist"], accessories: ["Kit son Zoom F6", "Lumière Aputure 300D"] },
  },
  {
    id: "6",
    name: "Daniel Holt",
    handle: "@daniel.holt",
    role: "Photographer",
    city: "London",
    radiusKm: 100,
    price: 540,
    rating: 4.9,
    reviews: 142,
    years: 5,
    responseTime: "~2h",
    shoots: 260,
    tags: ["Product", "Studio", "Brand"],
    categories: ["Product", "Brand"],
    cover: portfolio6,
    avatar: avatar6,
    bio: "Photographe produit et studio à Londres. Lumière millimétrée, packshots e-commerce et natures mortes pour marques premium.",
    portfolio: [portfolio6, portfolio1, heroImg1, portfolio4, portfolio3, heroImg3],
    offers: [
      { id: "packshot", name: "Packshots e-commerce", duration: "10 produits · fond blanc", price: 540, includes: ["Détourage inclus", "Formats web + print", "Livraison 3 jours"] },
      { id: "still", name: "Nature morte créative", duration: "Demi-journée · 12 visuels", price: 1300, popular: true, includes: ["Set design", "Retouche avancée", "Usage 1 an"] },
      { id: "launch", name: "Lancement produit", duration: "Journée · photo + reels", price: 2500, includes: ["Set design", "3 reels verticaux", "Usage illimité"] },
    ],
    reviewList: [
      { name: "Nora S.", avatar: avatar1, rating: 5, date: "Il y a 3 semaines", text: "Nos ventes ont grimpé après le nouveau shooting produit." },
      { name: "Ali R.", avatar: avatar2, rating: 5, date: "Il y a 2 mois", text: "Précision chirurgicale sur la lumière." },
    ],
    bookedDays: [18, 19, 23],
    equipment: { photo: ["Nikon Z8", "Nikkor 105mm Macro", "Nikkor 24-70mm"], video: [], accessories: ["Flash studio Profoto", "Fond papier studio"] },
  },
];

export const categories = ["For You", "Editorial", "Wedding", "Brand", "Music Video", "Product", "Street", "Documentary"];

export const cities = ["Toutes les villes", ...Array.from(new Set(creators.map((c) => c.city)))];

export function getCreator(id: string): Creator | undefined {
  return creators.find((c) => c.id === id);
}

export const timeSlots = ["09:00", "11:00", "14:00", "16:00", "18:00"];

export const monthLabel = "Novembre 2026";
export const monthDays = Array.from({ length: 30 }, (_, i) => i + 1);
export const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
