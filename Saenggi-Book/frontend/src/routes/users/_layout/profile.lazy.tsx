import { EditProfileForm } from "@/components/edit-profile-form";
import { RequireLoginMessage } from "@/components/require-login-message";
import { Separator } from "@/components/ui/separator";
import { useGetCurrentUser } from "@/stores/server/features/me/queries";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/users/_layout/profile")({
  component: Profile,
});

function Profile() {
  const { data: currentUser } = useGetCurrentUser();
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">프로필 수정</h3>
        <p className="text-sm text-muted-foreground"></p>
      </div>
      <Separator />
      {!currentUser ? (
        <RequireLoginMessage />
      ) : (
        <div className="w-full max-w-lg">
          <EditProfileForm />
        </div>
      )}
    </div>
  );
}
