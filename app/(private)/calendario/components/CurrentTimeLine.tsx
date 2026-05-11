"use client";
import React from "react";

export default function CurrentTimeLine() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const top = now.getHours() + now.getMinutes() / 60;
  return (
    <div
      className="absolute left-0 right-0 flex items-center pointer-events-none"
      style={{ top: `calc(((100vh - 179px) / 12) * ${top})` }}
    >
      <div className="size-2 rounded-full bg-red-500 -ml-1" />
      <div className="flex-1 h-px bg-red-500" />
    </div>
  );
}
