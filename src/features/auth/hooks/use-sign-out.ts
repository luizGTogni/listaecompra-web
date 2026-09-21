import { useRouter } from "next/navigation";
import { useAuthStore } from "../store";

// Clearing the session is enough: the query cache is emptied by
// <ClearCacheOnSignOut /> and the route guards send the user to /sign-in.
export function useSignOut() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  return function signOut() {
    clearSession();
    router.replace("/sign-in");
  };
}
