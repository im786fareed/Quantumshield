import Image from "next/image";

export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="QuantumShield Logo"
      width={512}
      height={512}
      className={className}
      priority
    />
  );
}
