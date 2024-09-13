import Loader from "@/components/Loader";
import { useAuth } from "../hooks/useAuth";
import { NextComponentType, NextPageContext } from "next";
import { ReactElement } from "react";

const withAuth = <P extends object>(
  WrappedComponent: NextComponentType<NextPageContext, unknown, P>
): NextComponentType<NextPageContext, unknown, P> => {
  const WithAuth = (props: P): ReactElement | null => {
    const { isLoading, isError } = useAuth();

    if (isLoading) {
      return <Loader />;
    }

    if (isError) {
      return null; // The useAuth hook will redirect to login page
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuth;
};

export default withAuth;
