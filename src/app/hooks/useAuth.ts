import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface AuthResponse {
  message: string;
}

const checkAuth = async (): Promise<AuthResponse> => {
  const res = await fetch("/api/check-auth");
  if (!res.ok) {
    throw new Error("Not authenticated");
  }
  return res.json();
};

export const useAuth = (): UseQueryResult<AuthResponse, Error> => {
  const router = useRouter();

  const res = useQuery({
    queryKey: ["auth"],
    queryFn: checkAuth,
    retry: false,
  });

  if (res.error) {
    router.replace("/login");
  }

  return res;
};
