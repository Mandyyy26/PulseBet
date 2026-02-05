'use client';
import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: Date;
  onExpire?: () => void;
}

export function CountdownTimer({ endTime, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({ minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = endTime.getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, expired: true });
        if (onExpire) onExpire();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ minutes, seconds, expired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-2 text-orange-600 font-bold animate-pulse">
        <span className="text-xl">⏱️</span>
        <span>RESOLVING...</span>
      </div>
    );
  }

  const isUrgent = timeLeft.minutes === 0 && timeLeft.seconds <= 30;

  return (
    <div className={`flex items-center gap-2 font-bold text-lg ${
      isUrgent ? 'text-red-600 animate-pulse' : 'text-gray-700'
    }`}>
      <span className="text-xl">⏱️</span>
      <span>
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
