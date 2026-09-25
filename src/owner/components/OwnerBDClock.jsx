import { useState, useEffect } from "react";

export default function OwnerBDClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const bd = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  const date = bd.toLocaleDateString("en-BD", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
  const time = bd.toLocaleTimeString("en-BD", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  });

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-7 h-7 rounded-[6px] flex items-center justify-center flex-shrink-0"
        style={{
          background: "rgba(234,179,8,0.1)",
          border: "1px solid rgba(234,179,8,0.25)",
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#eab308"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <div>
        <p className="text-[13px] font-bold text-white font-mono leading-none tracking-wide">
          {time}
        </p>
        <p className="text-[10px] text-muted mt-0.5 leading-none">
          {date} · BD Time
        </p>
      </div>
    </div>
  );
}
