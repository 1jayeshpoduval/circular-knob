"use client";
import { useState, useRef, useEffect } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";

export default function Home() {
  const [isKnobHovered, setIsKnobHovered] = useState(false);
  const [isKnobDragged, setIsKnobDragged] = useState(false);

  // Angle display
  const [knobAngleDisplay, setKnobAngleDisplay] = useState(0);

  const knobAngle = useMotionValue(0);

  // Subscribe to updates
  useMotionValueEvent(knobAngle, "change", (latest) => {
    setKnobAngleDisplay(Number(latest.toFixed(0)));
  });

  const knobRef = useRef();

  useEffect(() => {
    if (!isKnobDragged || !knobRef.current) return;

    const handlePointerMove = (e) => {
      const { clientX, clientY } = e;
      const { width, left, height, top } =
        knobRef.current.getBoundingClientRect();
      const knobCenterX = left + width / 2;
      const knobCenterY = top + height / 2;

      const dx = clientX - knobCenterX; // x-angle
      const dy = clientY - knobCenterY; // y-angle

      const angleRadian = Math.atan2(dy, dx); // atan2 gives 360deg values
      const angleDegree = angleRadian * (180 / Math.PI); // Convert radians to degrees

      knobAngle.set(angleDegree);
    };

    const handlePointerUp = () => {
      setIsKnobDragged(false);
      setIsKnobHovered(false);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointermove", handlePointerMove);
    };

    if (isKnobDragged) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [isKnobDragged]);

  const handlePointerDown = () => {
    setIsKnobDragged(true);
    setTimeout(() => {
      setIsKnobHovered(false);
    }, 200);
  };

  return (
    <section className="relative h-screen bg-background flex flex-col gap-8 items-center justify-center">
      <motion.div
        ref={knobRef}
        className={`before:rounded-full ${
          isKnobHovered || isKnobDragged ? "before:hidden" : "before:block"
        } before:absolute before:-inset-2 before:border-2 active:cursor-grabbing before:border-foreground before:size-24  before:content-['']  size-20 relative cursor-grab relative z-20 rounded-full bg-foreground flex items-start justify-center`}
        onPointerEnter={() => setIsKnobHovered(true)}
        onPointerLeave={() => setIsKnobHovered(false)}
        onPointerDown={handlePointerDown}
        style={{
          rotate: knobAngle,
        }}
        animate={{
          scale: isKnobDragged || isKnobHovered ? 1.4 : 1,
        }}
        transition={{
          type: "spring",
          mass: 1.5,
          stiffness: 580,
          damping: 45,
        }}
        whileTap={{ scale: 1.25 }}
      >
        <div className="h-[calc(50%-2.5px)] rounded-full w-[5px] bg-white translate-y-[10%]"></div>
        <AnimatePresence>
          {isKnobDragged && (
            <motion.div
              className="h-[30px] w-[2px] bg-foreground absolute bottom-[calc(100%+10px)]"
              initial={{ scale: 0.5, opacity: 0, transformOrigin: "bottom" }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                mass: 1,
                stiffness: 730,
                damping: 49,
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
                transition: { bounce: 0.1, duration: 0.1 },
              }}
            >
              <span className="select-none absolute bottom-10 font-semibold rounded-lg p-0.5 tabular-nums w-[50px] bg-foreground/10 -translate-x-[25px] flex justify-center">{`${knobAngleDisplay}°`}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
