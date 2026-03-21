import { ContractorForm } from "@/components/admin/ContractorForm";

export default function AdminContractorNewPage() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Новый подрядчик</h1>
      <ContractorForm mode="create" />
    </div>
  );
}

