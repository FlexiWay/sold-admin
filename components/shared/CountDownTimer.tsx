import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetTimestamp: number; // The target date as a Unix timestamp
  totalTime: number; // The total time in seconds
  onFinish:any;
  timerMsg:any;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ totalTime, targetTimestamp,onFinish,timerMsg }) => {
  const calculateTimeLeft = () => {
    if (!targetTimestamp || !totalTime) return {};

    const now = +new Date();
    const elapsed = now - targetTimestamp * 1000; // Convert targetTimestamp to milliseconds
    const remaining = totalTime * 1000 - elapsed; // Total time minus elapsed time

    let timeLeft: any = {};

    if (remaining > 0) {
      timeLeft = {
        days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
        hours: Math.floor((remaining / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((remaining / 1000 / 60) % 60),
        seconds: Math.floor((remaining / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (Object.keys(newTimeLeft).length === 0) {
        //setIsTimeUp(false);
        onFinish();
       // clearTimeout(timer);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = () => {
    //return `${timeLeft.days || 0}:${timeLeft.hours || 0}:${timeLeft.minutes || 0}:${timeLeft.seconds || 0}`;
    return timerMsg+" "+`${timeLeft.hours || 0}:${timeLeft.minutes || 0}:${timeLeft.seconds || 0}`;

  };

  return (
    <div>
      {isTimeUp ? (
        <span>Time's up!</span>
      ) : (
        <div>{formatTime()}</div>
      )}
    </div>
  );
};

export default CountdownTimer;