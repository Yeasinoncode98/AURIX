import { useState, useEffect } from 'react'

export default function AdminBDClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Bangladesh time = UTC+6
  const bd = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }))

  const date = bd.toLocaleDateString('en-BD', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    timeZone: 'Asia/Dhaka',
  })
  const time = bd.toLocaleTimeString('en-BD', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true, timeZone: 'Asia/Dhaka',
  })

  return (
    <div className="flex items-center gap-2.5">
      {/* Clock icon */}
      <div className="w-7 h-7 rounded-[6px] bg-[#141414] border border-[#222] flex items-center justify-center">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C1121F" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <div>
        <p className="text-[13px] font-bold text-white font-mono leading-none tracking-wide">
          {time}
        </p>
        <p className="text-[10px] text-muted mt-0.5 leading-none">{date} · BD Time</p>
      </div>
    </div>
  )
}
