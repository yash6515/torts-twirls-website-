import { useState, useEffect, useRef } from 'react';

const useCounter = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const hasAnimated = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        const startTime = performance.now();
        const step = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(start + (end - start) * eased));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, start]);

  return { count, ref };
};

export default useCounter;
