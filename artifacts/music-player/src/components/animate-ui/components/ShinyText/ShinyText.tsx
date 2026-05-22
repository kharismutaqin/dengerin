import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'framer-motion';
import './ShinyText.css';

export default function GradientText({
  children,
  iconUrl = '',
  className = '',
  colors = ["#a855f7", "#3b82f6", "#d946ef", "#a855f7"],
  animationSpeed = 6,
  showBorder = false,
  direction = 'horizontal',
  pauseOnHover = false,
  yoyo = true
}) {
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef(null);

  const animationDuration = animationSpeed * 1000;

  useAnimationFrame(time => {
    if (isPaused) { lastTimeRef.current = null; return; }
    if (lastTimeRef.current === null) { lastTimeRef.current = time; return; }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += deltaTime;

    // Menghitung progress berdasarkan durasi animasi
    const cycleTime = elapsedRef.current % (yoyo ? animationDuration * 2 : animationDuration);

    if (yoyo) {
      progress.set(cycleTime < animationDuration ? (cycleTime / animationDuration) * 100 : 100 - ((cycleTime - animationDuration) / animationDuration) * 100);
    } else {
      progress.set((elapsedRef.current / animationDuration) * 100);
    }
  });

  const backgroundPosition = useTransform(progress, p => direction === 'vertical' ? `50% ${p}%` : `${p}% 50%`);
  const gradientAngle = direction === 'horizontal' ? 'to right' : 'to bottom';
  const gradientColors = colors.join(', ');

  const gradientStyle = {
    backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
    backgroundSize: direction === 'horizontal' ? '300% 100%' : '100% 300%',
    backgroundPosition
  };

  const iconStyle = iconUrl ? {
    WebkitMaskImage: `url(${iconUrl})`,
    maskImage: `url(${iconUrl})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    backgroundColor: 'white',
    ...gradientStyle
  } : {};

  return (
    <motion.div 
      className={`animated-gradient-text ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {iconUrl ? (
        <motion.div className="icon-content" style={iconStyle} />
      ) : (
        <motion.div className="text-content" style={{ ...gradientStyle, backgroundPosition }}>
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}