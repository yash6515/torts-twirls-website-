import { useEffect, useRef } from 'react';

const useScrollReveal = (options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            if (!options.repeat) observer.unobserve(entry.target);
          } else if (options.repeat) {
            entry.target.classList.remove('revealed');
          }
        });
      },
      { threshold: options.threshold || 0.12, rootMargin: options.rootMargin || '0px 0px -40px 0px' }
    );

    // Handle both single element and container with children
    if (options.children) {
      const targets = el.querySelectorAll('.reveal-on-scroll');
      targets.forEach(t => observer.observe(t));
    } else {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [options.children, options.threshold, options.rootMargin, options.repeat]);

  return ref;
};

export default useScrollReveal;
