import React from "react";

interface WelcomeTitleProps {
  name: string;
  lastName: string;
}
export default function WelcomeTitle({ name, lastName }: WelcomeTitleProps) {
  return (
    <h3 className="font-semibold text-[24px] sm:text-[30px] md:text-[32px] lg:text-[36px] leading-[115%]">
      Bienvenido: Dr(a). {name} {lastName}
    </h3>
  );
}
