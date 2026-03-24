import { LoginDebug } from "@/components/test/login-debug";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/test/login-debug")({
  component: LoginDebugPage,
});

function LoginDebugPage() {
  return <LoginDebug />;
}
