import { PlaceForm } from "@/components/admin/PlaceForm";

export default function AdminPlaceNewPage() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Новое место</h1>
      <PlaceForm mode="create" />
    </div>
  );
}

