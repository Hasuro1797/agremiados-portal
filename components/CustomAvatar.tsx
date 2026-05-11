"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export interface CustomAvatarProps {
  avatar?: string | undefined;
  name: string | undefined;
  last_name: string | undefined;
  styleAvatar?: string;
  styleFallback?: string;
  styleImage?: string;
}

export default function CustomAvatar({
  avatar,
  name,
  last_name,
  styleAvatar,
  styleFallback,
  styleImage,
}: CustomAvatarProps) {
  const createAvatarFallback = (
    name: string | undefined,
    last_name: string | undefined,
  ) => {
    if (!name || !last_name) return "UD";
    return name.charAt(0).toUpperCase() + last_name.charAt(0).toUpperCase();
  };
  console.log("CustomAvatar renderizado con:", { name, last_name, avatar });
  return (
    <Avatar className={styleAvatar}>
      <AvatarImage src={avatar} alt={name} className={styleImage} />
      <AvatarFallback className={styleFallback}>
        {createAvatarFallback(name, last_name)}
      </AvatarFallback>
    </Avatar>
  );
}
