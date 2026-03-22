import { MapsPageClient } from "@/components/maps/MapsPageClient";
import { getSiteUrl } from "@/lib/seo/siteUrl";

export async function generateMetadata() {
  const canonical = `${await getSiteUrl()}/maps`;
  return {
    title: "Карта интересных мест Беларуси | kulture.by",
    description: "Интерактивная карта: природа, замки, музеи и гастро по всей Беларуси. Кластеры, поиск и геолокация.",
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}

export default function MapsPage() {
  return <MapsPageClient />;
}
