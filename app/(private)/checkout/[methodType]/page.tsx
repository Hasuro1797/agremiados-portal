import React from "react";
import CheckoutDetail from "./components/CheckoutDetail";

export default function CheckoutPage({
  params,
}: {
  params: { methodType: string };
}) {
  const { methodType } = params;
  return <CheckoutDetail methodType={methodType} />;
}
