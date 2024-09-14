import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";

const checkAuth = async (): Promise<boolean> => {
  const response = await fetch("/api/check-auth");
  if (!response.ok) {
    throw new Error("Not authenticated");
  }
  return response.json();
};

const withAuth = (WrappedComponent: React.ComponentType) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function WithAuth(props: any): ReactNode {
    const router = useRouter();
    const { isLoading, isError } = useQuery({
      queryKey: ["auth"],
      queryFn: checkAuth,
    });

    useEffect(() => {
      if (isError) {
        router.push("/login");
      }
    }, [isError, router]);

    if (isLoading) {
      return <Loader />;
    }

    if (isError) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
