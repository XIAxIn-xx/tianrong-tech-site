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
  const arrowOpacity = useTransform(heroScrollProgress, [0, 0.65, 1], [1, 0.72, 0]);

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
    <section ref={heroRef} className="relative h-[100svh] min-h-[560px] overflow-hidden bg-[#101820] text-white" aria-labelledby="video-hero-title">
      <video
        ref={videoRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay={videoEnabled}
        muted
        loop
        playsInline
        preload="none"
        poster={POSTER_SRC}
      >
        {videoEnabled && <source src={VIDEO_SRC} type="video/mp4" />}
      </video>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,15,0.82)_0%,rgba(3,8,15,0.48)_30%,rgba(3,8,15,0.08)_68%,rgba(3,8,15,0.3)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,8,15,0.3)_0%,rgba(3,8,15,0.08)_42%,transparent_100%)]" />

      <div className="relative z-10 mx-auto flex h-full min-h-[560px] w-[min(1240px,calc(100%-32px))] items-start justify-center pt-24 text-center sm:pt-28 md:pt-32">
        <div className="w-full">
          <motion.h1
            id="video-hero-title"
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0.2 } : { duration: 0.65, delay: 0.08 }}
            className="cjk-heading text-[clamp(1.35rem,4.8vw,3.75rem)] font-semibold leading-[1.12]"
          >
            <span className="keep-phrase">机器人软硬件产品与技术集成商</span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0.2 } : { duration: 0.65, delay: 0.16 }}
            className="cjk-body mx-auto mt-5 max-w-6xl text-base font-medium leading-7 text-white/90 md:mt-6 md:text-lg md:leading-8 lg:whitespace-nowrap lg:text-[clamp(0.9rem,1.15vw,1.05rem)]"
          >
            聚焦<span className="keep-phrase">机器人本体</span>、<span className="keep-phrase">任务载荷</span>、<span className="keep-phrase">ROBOX 远程控制盒</span>与<span className="keep-phrase">机器人调度平台</span>，为<span className="keep-phrase">合作伙伴</span>提供可组合、可集成、可扩展的<span className="keep-phrase">软硬件产品</span>。
          </motion.p>

          <div className="mt-7 flex flex-nowrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-none bg-[#0F62FE] text-white shadow-none hover:bg-[#0050E6]">
              <a href="#contact">
                <span className="keep-phrase">项目咨询</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-none border-white/75 bg-transparent text-white shadow-none hover:bg-white/10">
              <a href="#matrix">
                <span className="keep-phrase">查看产品矩阵</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        initial={false}
        animate={reduceMotion ? { y: 0 } : { y: [0, 3, 0] }}
        transition={reduceMotion ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity: reduceMotion ? 0.72 : arrowOpacity }}
        className="pointer-events-none absolute bottom-7 left-1/2 z-10 grid h-16 w-16 -translate-x-1/2 place-items-center select-none rounded-full border border-white/30 bg-white/10 text-white/80 shadow-[0_10px_32px_rgba(0,0,0,0.2)] backdrop-blur-md md:bottom-8"
      >
        <ChevronDown className="h-9 w-9" strokeWidth={1.4} />
      </motion.div>
    </section>
  );
}

export default VideoHero;
