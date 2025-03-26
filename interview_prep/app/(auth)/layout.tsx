import { isAuthenticated } from "@/lib/actions/auth.actions";
import { redirect } from "next/navigation";
import React from "react";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (isUserAuthenticated) {
    redirect("/");
  }
  return <div className="auth-layout">{children}</div>;
};

export default layout;
