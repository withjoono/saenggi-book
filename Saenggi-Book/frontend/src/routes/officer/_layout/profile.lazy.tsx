import { EditOfficerProfileForm } from "@/components/edit-officer-profile-form";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/officer/_layout/profile")({
  component: EditOfficerProfile,
});

function EditOfficerProfile() {
  return (
    <div className="space-y-8 py-14">
      <h3 className="text-center text-2xl font-semibold">프로필 수정</h3>
      <EditOfficerProfileForm className="mx-auto flex max-w-md flex-col items-center gap-4" />
    </div>
  );
}
