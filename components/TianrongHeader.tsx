"use client";

import { useEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";

type TianrongHeaderProps = {
  basePath?: string;
  containerClassName?: string;
  brand?: "image" | "mark";
  sectionIds?: string[];
  overlay?: boolean;
};

const productItems = [
  ["机器人本体", "robot-series"],
  ["任务载荷模块", "payload-modules"],
  ["ROBOX 远程控制盒", "robox"],
  ["机器人调度平台", "rsp-platform"]
] as const;

const productSectionIds: readonly string[] = ["matrix", ...productItems.map(([, id]) => id)];
const defaultSectionIds = ["matrix", "robot-series", "payload-modules", "robox", "rsp-platform", "case", "about", "contact"];

export function TianrongHeader({
  basePath = "",
  containerClassName = "w-[min(1240px,calc(100%-32px))]",
  brand = "image",
  sectionIds = defaultSectionIds,
  overlay = false
}: TianrongHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const hrefFor = (id: string) => `${basePath}#${id}`;
  const closeMenus = () => {
    setMobileOpen(false);
    setProductOpen(false);
  };

  useEffect(() => {
    if (!mobileOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const updateHome = () => {
      if (overlay) setIsScrolled(window.scrollY > 24);
      if (window.scrollY < 120) setActiveSection("home");
    };
    updateHome();
    window.addEventListener("scroll", updateHome, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-28% 0px -56% 0px", threshold: [0.15, 0.35, 0.6] }
    );
    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateHome);
    };
  }, [sectionIds, overlay]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (productOpen) {
        setProductOpen(false);
        return;
      }
      if (mobileOpen) {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, productOpen]);

  const isProductsActive = productSectionIds.includes(activeSection);
  const isHeroOverlay = overlay && !isScrolled && activeSection === "home";
  const brandActiveClass = brand === "mark" ? "text-[#0B5CAD]" : "text-[#0F62FE]";
  const activeClass = isHeroOverlay ? "text-[#B9D4FF]" : brandActiveClass;
  const focusClass = isHeroOverlay ? "focus-visible:ring-white/70" : brand === "mark" ? "focus-visible:ring-[#0B5CAD]/45" : "focus-visible:ring-[#0F62FE]/45";
  const activeIndicator = isHeroOverlay ? "after:bg-[#B9D4FF]" : brand === "mark" ? "after:bg-[#0B5CAD]" : "after:bg-[#0F62FE]";

  const navClass = (active: boolean) =>
    `relative inline-flex h-12 items-center whitespace-nowrap px-1 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 ${focusClass} ${isHeroOverlay ? "focus-visible:ring-offset-0" : "focus-visible:ring-offset-2"} ${active ? `${activeClass} after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 ${activeIndicator}` : isHeroOverlay ? "text-white/85 hover:text-white" : "text-[#525252] hover:text-[#0F62FE]"}`;

  function handleProductBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setProductOpen(false);
  }

  const renderBrand = (): ReactNode => {
    if (brand === "mark") {
      return <span className="grid h-9 w-9 shrink-0 place-items-center rounded border border-[#1C3F5F] bg-[#10283E] text-sm font-black text-white">TR</span>;
    }
    return (
      <Image
        src="/images/tianrong/tianrong-logo.png"
        alt="天戎科技"
        width={1080}
        height={820}
        priority
        className="h-12 w-16 shrink-0 object-contain"
        style={{ filter: "brightness(0) saturate(100%) invert(31%) sepia(97%) saturate(3697%) hue-rotate(211deg) brightness(98%) contrast(107%)" }}
      />
    );
  };

  return (
    <header className={isHeroOverlay ? "fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-gradient-to-b from-black/35 to-transparent" : overlay ? "fixed inset-x-0 top-0 z-50 border-b border-[#E0E0E0] bg-white/95 backdrop-blur" : "sticky top-0 z-50 border-b border-[#E0E0E0] bg-white/95 backdrop-blur"}>
      <div className={`relative mx-auto flex h-[74px] items-center justify-between gap-6 ${containerClassName}`}>
        <Link href="/" className={`flex shrink-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 ${isHeroOverlay ? "focus-visible:ring-white/70" : "focus-visible:ring-[#0F62FE]/45 focus-visible:ring-offset-2"}`} onClick={closeMenus}>
          {renderBrand()}
          <span className={brand === "mark" ? "text-base font-black tracking-normal" : isHeroOverlay ? "text-base font-semibold text-white" : "text-base font-semibold"}>天戎科技</span>
        </Link>

        <nav aria-label="主导航" className="hidden min-w-0 flex-1 items-center justify-end gap-5 lg:flex">
          <a href={hrefFor("top")} className={navClass(activeSection === "home")} onClick={closeMenus}>首页</a>
          <div
            className="relative flex h-12 items-center"
            onMouseEnter={() => setProductOpen(true)}
            onMouseLeave={() => setProductOpen(false)}
            onFocus={() => setProductOpen(true)}
            onBlur={handleProductBlur}
          >
            <a href={hrefFor("matrix")} className={navClass(isProductsActive)} onClick={closeMenus}>产品矩阵</a>
            <button
              type="button"
              aria-label="展开产品矩阵菜单"
              aria-expanded={productOpen}
              onClick={() => setProductOpen((open) => !open)}
              className={`ml-0.5 inline-flex h-8 w-7 items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 ${isHeroOverlay ? "text-white/85 hover:text-white focus-visible:ring-white/70" : "text-[#525252] hover:text-[#0F62FE] focus-visible:ring-[#0F62FE]/45"} ${isProductsActive ? activeClass : ""}`}
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${productOpen ? "rotate-180" : ""}`} />
            </button>
            {productOpen && (
              <div role="menu" className="absolute left-0 top-[calc(100%-1px)] z-[60] w-[300px] border border-[#E0E0E0] bg-white p-2 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                {productItems.map(([label, id]) => (
                  <a
                    key={id}
                    role="menuitem"
                    href={hrefFor(id)}
                    onClick={closeMenus}
                    className={`keep-phrase flex min-h-11 items-center rounded px-3 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F62FE]/45 ${activeSection === id ? `${brandActiveClass} bg-[#F4F8FC]` : "text-[#3D3D3D] hover:bg-[#F7F9FC] hover:text-[#0F62FE]"}`}
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <a href={hrefFor("case")} className={navClass(activeSection === "case")} onClick={closeMenus}>实践案例</a>
          <a href={hrefFor("about")} className={navClass(activeSection === "about")} onClick={closeMenus}>关于天戎</a>
          <a href={hrefFor("contact")} className={navClass(activeSection === "contact")} onClick={closeMenus}>联系我们</a>
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          aria-label={mobileOpen ? "关闭主菜单" : "打开主菜单"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className={`grid h-11 w-11 shrink-0 place-items-center focus-visible:outline-none focus-visible:ring-2 lg:hidden ${isHeroOverlay ? "text-white focus-visible:ring-white/70" : "text-[#161616] focus-visible:ring-[#0F62FE]/45 focus-visible:ring-offset-2"}`}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {mobileOpen && (
          <div className="absolute inset-x-0 top-[74px] z-50 max-h-[calc(100dvh-74px)] overflow-y-auto border-t border-[#E0E0E0] bg-white shadow-[0_16px_32px_rgba(15,23,42,0.1)] lg:hidden">
            <nav aria-label="移动端主导航" className="flex flex-col gap-1 p-4">
              <a href={hrefFor("top")} onClick={closeMenus} className="keep-phrase flex min-h-12 items-center border-b border-[#F0F0F0] px-2 text-base text-[#3D3D3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F62FE]/45">首页</a>
              <button
                type="button"
                aria-expanded={productOpen}
                onClick={() => setProductOpen((open) => !open)}
                className={`flex min-h-12 items-center justify-between border-b border-[#F0F0F0] px-2 text-left text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F62FE]/45 ${isProductsActive ? brandActiveClass : "text-[#3D3D3D]"}`}
              >
                <span className="keep-phrase">产品矩阵</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${productOpen ? "rotate-180" : ""}`} />
              </button>
              {productOpen && (
                <div className="border-b border-[#F0F0F0] py-1 pl-3" role="menu">
                  {productItems.map(([label, id]) => (
                    <a key={id} role="menuitem" href={hrefFor(id)} onClick={closeMenus} className={`keep-phrase flex min-h-11 items-center px-2 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F62FE]/45 ${activeSection === id ? `${brandActiveClass} font-semibold` : "text-[#525252]"}`}>
                      {label}
                    </a>
                  ))}
                </div>
              )}
              <a href={hrefFor("case")} onClick={closeMenus} className="keep-phrase flex min-h-12 items-center border-b border-[#F0F0F0] px-2 text-base text-[#3D3D3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F62FE]/45">实践案例</a>
              <a href={hrefFor("about")} onClick={closeMenus} className="keep-phrase flex min-h-12 items-center border-b border-[#F0F0F0] px-2 text-base text-[#3D3D3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F62FE]/45">关于天戎</a>
              <a href={hrefFor("contact")} onClick={closeMenus} className="keep-phrase flex min-h-12 items-center border-b border-[#F0F0F0] px-2 text-base text-[#3D3D3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F62FE]/45">联系我们</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
