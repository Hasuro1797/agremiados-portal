"use client";

import { ApolloProvider } from "@apollo/client";
import client from "@/graphql/apollo.client";
import { UserStoreProvider } from "@/providers/user-provider";
import { Toaster } from "sonner";
import { OrganizationProvider } from "@/providers/organization-provider";
import { DynamicHead } from "@/components/DynamicHead";
import { AppLoader } from "@/components/AppLoader";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApolloProvider client={client}>
      <OrganizationProvider>
        <DynamicHead />
        <AppLoader>
          <UserStoreProvider>
            {children}
            <Toaster />
          </UserStoreProvider>
        </AppLoader>
      </OrganizationProvider>
    </ApolloProvider>
  );
}
