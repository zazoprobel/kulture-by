import { TourForm } from "@/components/admin/TourForm";

export default function AdminTourNewPage() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Новый тур</h1>
      <TourForm mode="create" />
    </div>
  );
}

