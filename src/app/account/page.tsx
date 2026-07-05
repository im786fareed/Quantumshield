import type { Metadata } from "next";
import AccountSecurity from "@/components/AccountSecurity";

export const metadata: Metadata = {
  title: "Account & Security – QuantumShield",
  description:
    "Manage your QuantumShield sign-in and 2-step verification (authenticator app or SMS).",
};

export default function AccountPage() {
  return <AccountSecurity />;
}
