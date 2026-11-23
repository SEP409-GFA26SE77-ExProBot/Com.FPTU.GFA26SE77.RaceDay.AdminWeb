"use client";

import { RouteTab } from "@/context/ActiveTabContext";
import SystemErrorRefundsPanel from "@/components/finance/SystemErrorRefundsPanel";

export default function ManagerRefundClaimsPage() {
  return (
    <RouteTab tab="refund-claims">
      <SystemErrorRefundsPanel tabId="refund-claims" />
    </RouteTab>
  );
}
