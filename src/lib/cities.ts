/** Ciudades disponibles. `aliases` = cómo pueden venir escritas en las fuentes de datos */
export type City = { id: string; name: string; aliases: string[] };

export const CITIES: City[] = [
  { id: "madrid", name: "Madrid", aliases: ["madrid"] },
  { id: "barcelona", name: "Barcelona", aliases: ["barcelona", "badalona", "l'hospitalet de llobregat", "hospitalet"] },
  { id: "valencia", name: "Valencia", aliases: ["valencia", "valència"] },
  { id: "sevilla", name: "Sevilla", aliases: ["sevilla", "seville"] },
  { id: "bilbao", name: "Bilbao", aliases: ["bilbao", "barakaldo"] },
  { id: "malaga", name: "Málaga", aliases: ["malaga", "málaga"] },
  { id: "zaragoza", name: "Zaragoza", aliases: ["zaragoza"] },
  { id: "murcia", name: "Murcia", aliases: ["murcia"] },
  { id: "granada", name: "Granada", aliases: ["granada"] },
  { id: "alicante", name: "Alicante", aliases: ["alicante", "alacant"] },
  { id: "valladolid", name: "Valladolid", aliases: ["valladolid"] },
  { id: "donostia", name: "San Sebastián", aliases: ["san sebastian", "san sebastián", "donostia"] },
  { id: "pamplona", name: "Pamplona", aliases: ["pamplona", "iruña"] },
  { id: "santiago", name: "Santiago", aliases: ["santiago de compostela"] },
  { id: "coruna", name: "A Coruña", aliases: ["a coruña", "la coruña", "a coruna"] },
  { id: "vigo", name: "Vigo", aliases: ["vigo"] },
  { id: "palma", name: "Palma", aliases: ["palma", "palma de mallorca"] },
  { id: "laspalmas", name: "Las Palmas", aliases: ["las palmas de gran canaria", "las palmas"] },
  { id: "tenerife", name: "Tenerife", aliases: ["santa cruz de tenerife", "la laguna"] },
  { id: "cordoba", name: "Córdoba", aliases: ["córdoba", "cordoba"] },
  { id: "oviedo", name: "Oviedo", aliases: ["oviedo"] },
  { id: "gijon", name: "Gijón", aliases: ["gijón", "gijon"] },
  { id: "santander", name: "Santander", aliases: ["santander"] },
  { id: "salamanca", name: "Salamanca", aliases: ["salamanca"] },
  { id: "lisboa", name: "Lisboa", aliases: ["lisboa", "lisbon"] },
  { id: "porto", name: "Oporto", aliases: ["porto", "oporto"] },
];

export const cityById = (id: string) => CITIES.find((c) => c.id === id);

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/** ¿Pertenece el nombre de ciudad de un recinto a alguna de las ciudades elegidas? */
export function matchCity(venueCity: string, cityIds: string[]): City | undefined {
  const v = norm(venueCity);
  return cityIds
    .map(cityById)
    .find((c): c is City => !!c && c.aliases.some((a) => norm(a) === v));
}
