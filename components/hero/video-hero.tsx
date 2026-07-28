"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { Button } from "@/components/ui/button";

const VIDEO_SRC = "/videos/tianrong/s07-complex-scene-2.mp4";
const POSTER_SRC = "/images/tianrong/industrial-inspection.png";

export function VideoHero() {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const contentOpacity = useTransform(heroScrollProgress, [0, 0.42, 0.78], [1, 0.82, 0]);
  const contentY = useTransform(heroScrollProgress, [0, 0.78], [0, -56]);
  const contentScale = useTransform(heroScrollProgress, [0, 0.78], [1, 0.965]);
  const videoScale = useTransform(heroScrollProgress, [0, 1], [1, 1.045]);
  const arrowOpacity = useTransform(heroScrollProgress, [0, 0.5, 0.9], [1, 0.78, 0]);
  const arrowY = useTransform(heroScrollProgress, [0, 0.4, 0.9], [0, 12, 32]);
  const arrowScale = useTransform(heroScrollProgress, [0, 0.45, 0.9], [1, 1.05, 0.88]);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setVideoEnabled(!reducedMotionQuery.matches);

    updateMotionPreference();
    reducedMotionQuery.addEventListener("change", updateMotionPreference);
    return () => reducedMotionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!videoEnabled) {
      video.pause();
      return;
    }

    video.load();
    void video.play().catch(() => undefined);
  }, [videoEnabled]);

  return (
    <section
      ref={heroRef}
      className="sticky top-0 z-0 h-[100svh] min-h-[560px] overflow-hidden bg-[var(--tr-ink-deep)] text-white"
      aria-labelledby="video-hero-title"
      aria-describedby="video-hero-description"
    >
      <motion.div
        initial={false}
        style={{ scale: reduceMotion ? 1 : videoScale }}
        className="absolute inset-0 will-change-transform"
      >
        <video
          ref={videoRef}
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
          autoPlay={videoEnabled}
          muted
          loop
          playsInline
          preload="none"
          poster={POSTER_SRC}
        >
          {videoEnabled && <source src={VIDEO_SRC} type="video/mp4" />}
        </video>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(9,29,45,0.92)_0%,rgba(9,29,45,0.58)_32%,rgba(9,29,45,0.14)_68%,rgba(9,29,45,0.42)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(9,29,45,0.28)_0%,rgba(9,29,45,0.06)_46%,transparent_100%)]" />

      <div className="relative z-10 mx-auto flex h-full min-h-[560px] w-[min(1240px,calc(100%-32px))] items-start justify-center pt-24 text-center sm:pt-28 md:pt-32">
        <motion.div
          initial={false}
          style={{
            opacity: reduceMotion ? 1 : contentOpacity,
            y: reduceMotion ? 0 : contentY,
            scale: reduceMotion ? 1 : contentScale
          }}
          className="w-full origin-top will-change-transform"
        >
          <motion.h1
            id="video-hero-title"
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0.2 } : { duration: 0.65, delay: 0.08 }}
            className="cjk-heading mt-6 text-[clamp(2rem,5vw,4rem)] font-semibold leading-[1.1] tracking-[-0.035em]"
          >
            <span className="block keep-phrase">面向真实巡检场景的</span>
            <span className="mt-1 block keep-phrase">机器人智能产品服务商</span>
          </motion.h1>

          <motion.p
            id="video-hero-description"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0.2 } : { duration: 0.65, delay: 0.16 }}
            className="cjk-body mx-auto mt-5 max-w-4xl text-base font-medium leading-7 text-white/88 md:mt-6 md:text-lg md:leading-8"
          >
            <span className="block lg:whitespace-nowrap">
              天戎科技以 <span className="keep-phrase">RSP 云控平台</span>、<span className="keep-phrase">数采平台</span>、<span className="keep-phrase">硬件背包与传感器集成</span>为核心，
            </span>
            <span className="block lg:whitespace-nowrap">
              为客户提供<span className="keep-phrase">机器人产品组合</span>、<span className="keep-phrase">现场适配</span>与<span className="keep-phrase">现场交付服务</span>。
            </span>
          </motion.p>

          <div className="mt-7 flex flex-nowrap justify-center gap-3">
            <Button asChild size="lg" className="tr-accent-button rounded-none text-white hover:bg-[var(--tr-primary-hover)]">
              <a href="#matrix">
                <span className="keep-phrase">查看产品矩阵</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-none border-white/75 bg-transparent text-white shadow-none hover:bg-white/10">
              <a href="#contact">
                <span className="keep-phrase">项目咨询</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>

      <div
        data-testid="hero-scroll-indicator"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-7 left-1/2 z-10 -translate-x-1/2 select-none md:bottom-8"
      >
        <motion.div
          initial={false}
          style={{
            opacity: reduceMotion ? 0.72 : arrowOpacity,
            y: reduceMotion ? 0 : arrowY,
            scale: reduceMotion ? 1 : arrowScale
          }}
        >
          <motion.div
            initial={{ y: 0, scale: 1 }}
            animate={reduceMotion ? { y: 0, scale: 1 } : { y: [0, 4, 0], scale: [1, 0.985, 1] }}
            transition={reduceMotion ? { duration: 0 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="grid h-16 w-16 place-items-center rounded-full border border-white/30 bg-white/10 text-white/80 shadow-[0_10px_32px_rgba(0,0,0,0.2)] backdrop-blur-md"
          >
            <ChevronDown className="h-9 w-9" strokeWidth={1.4} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default VideoHero;
