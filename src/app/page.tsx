"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import withAuth from "./hocs/withAuth";

function Home(): ReactNode {
  const router = useRouter();

  useEffect(() => {
    router.push("/models");
  }, [router]);

  return null;
}

export default withAuth(Home);
