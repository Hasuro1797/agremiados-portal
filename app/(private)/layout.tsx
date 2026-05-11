"use client";

import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useUserStore } from "@/providers/user-provider";
import { GET_STATUS_MEMBER } from "@/graphql/query/member.query";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const setPaymentStatus = useUserStore((state) => state.setPaymentStatus);

  const { data } = useQuery(GET_STATUS_MEMBER, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.getStatusMember) {
      const { status, hasPaymentPerDay, hasRegistered } = data.getStatusMember;
      setPaymentStatus(status, hasPaymentPerDay, hasRegistered);
    }
  }, [data, setPaymentStatus]);

  return <>{children}</>;
}
