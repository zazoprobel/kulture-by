import { VenueForm } from "@/components/admin/VenueForm";

export default function AdminVenueNewPage() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Новая площадка</h1>
      <VenueForm mode="create" />
    </div>
  );
}

