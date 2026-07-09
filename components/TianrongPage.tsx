import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getTianrongContent, getTianrongIcon, type TianrongLocale } from "@/data/tianrong";

type TianrongPageProps = {
  locale: TianrongLocale;
};

export function TianrongPage({ locale }: TianrongPageProps) {
  const content = getTianrongContent(locale);

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#101820]">
      <header className="sticky top-0 z-50 border-b border-[#DDE3EA] bg-[#F8FAFC]/92 backdrop-blur">
        <div className="mx-auto flex h-16 w-[min(1180px,calc(100%-32px))] items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded border border-[#1C3F5F] bg-[#10283E] text-sm font-black text-white">
              TR
            </span>
            <span className="text-base font-black tracking-normal">天戎科技</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[#52616F] lg:flex">
            {content.nav.map((item, index) => (
              <a key={item} href={`#section-${index}`} className="hover:text-[#0B5CAD]">
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#DDE3EA] bg-[#EEF2F5]">
          <div className="absolute inset-0 tianrong-blueprint opacity-70" />
          <div className="mx-auto grid min-h-[720px] w-[min(1180px,calc(100%-32px))] items-center gap-10 py-16 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="relative z-10 pt-8">
              <div className="inline-flex items-center gap-2 rounded border border-[#B7C3CE] bg-white/80 px-3 py-2 text-sm font-semibold text-[#31566F]">
                <span className="h-2 w-2 rounded-full bg-[#0B76D1]" />
                {content.hero.label}
              </div>
              <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.05] tracking-normal text-[#101820] md:text-7xl">
                {content.hero.title}
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#52616F] md:text-xl">{content.hero.subtitle}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-[#0B5CAD] text-white shadow-none hover:bg-[#084B8D]">
                  <a href="#section-5">
                    {content.hero.primary}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="dark" size="lg" className="border border-[#10283E] bg-white text-[#10283E] hover:bg-[#E9EEF3]">
                  <a href="#section-1">{content.hero.secondary}</a>
                </Button>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {content.hero.metrics.map(([title, text]) => (
                  <div key={title} className="rounded border border-[#D5DDE5] bg-white/82 p-4">
                    <div className="font-black text-[#10283E]">{title}</div>
                    <p className="mt-1 text-sm leading-6 text-[#667582]">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="rounded border border-[#C9D4DE] bg-[#101820] p-3 shadow-[0_24px_80px_rgba(16,24,32,0.18)]">
                <div className="relative aspect-[1.05] overflow-hidden rounded-sm bg-[#CAD3DC]">
                  <Image
                    src="/images/generated/glp-warehouse-patrol-2.png"
                    alt="Robot patrol in an industrial site"
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,32,0.05),rgba(16,24,32,0.72))]" />
                  <div className="absolute left-5 right-5 top-5 flex justify-between text-xs font-semibold text-white/80">
                    <span>SITE MAP / ROUTE A</span>
                    <span>ONLINE</span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 rounded border border-white/18 bg-[#101820]/78 p-4 text-white backdrop-blur">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-white/60">Inspection task</div>
                        <div className="mt-1 text-xl font-black">北门周界夜巡</div>
                      </div>
                      <div className="h-12 w-12 rounded-full border border-[#68B7FF] bg-[#0B5CAD]/30 tianrong-pulse" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-white/72">
                      <span>CAMERA</span>
                      <span>REMOTE</span>
                      <span>RECORD</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 hidden w-48 rounded border border-[#CCD6E0] bg-white p-4 shadow-[0_18px_50px_rgba(16,24,32,0.14)] md:block">
                <div className="text-xs font-bold text-[#667582]">DELIVERY BOARD</div>
                <div className="mt-3 space-y-2">
                  {content.process.slice(0, 4).map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm font-semibold text-[#10283E]">
                      <CheckCircle2 className="h-4 w-4 text-[#0B76D1]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Section id="section-0" title={content.capabilityTitle}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {content.capabilities.map(([icon, title, text]) => {
              const Icon = getTianrongIcon(icon);
              return (
                <article key={title} className="group min-h-[220px] rounded border border-[#DDE3EA] bg-white p-5 transition hover:-translate-y-1 hover:border-[#0B5CAD] hover:shadow-[0_18px_48px_rgba(16,24,32,0.1)]">
                  <Icon className="h-7 w-7 text-[#0B5CAD]" />
                  <h3 className="mt-8 text-xl font-black text-[#101820]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#667582]">{text}</p>
                </article>
              );
            })}
          </div>
        </Section>

        <Section id="section-1" title={content.scenarioTitle} tone="dark">
          <div className="grid gap-px overflow-hidden rounded border border-white/12 bg-white/12 md:grid-cols-2 lg:grid-cols-3">
            {content.scenarios.map(([icon, title, text]) => {
              const Icon = getTianrongIcon(icon);
              return (
                <article key={title} className="min-h-[210px] bg-[#10283E] p-6 transition hover:bg-[#173B5B]">
                  <Icon className="h-7 w-7 text-[#68B7FF]" />
                  <h3 className="mt-12 text-2xl font-black text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#B9C7D3]">{text}</p>
                </article>
              );
            })}
          </div>
        </Section>

        <Section id="section-2" title={content.valueTitle}>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded border border-[#DDE3EA] bg-white p-6">
              <div className="text-sm font-bold uppercase text-[#667582]">Inspection value</div>
              <div className="mt-5 space-y-4">
                {content.values.map((item) => (
                  <div key={item} className="flex gap-3 border-b border-[#EEF2F5] pb-4 last:border-0">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#0B5CAD]" />
                    <p className="text-lg font-semibold text-[#10283E]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[420px] overflow-hidden rounded border border-[#C9D4DE] bg-[#DDE5EC] p-6">
              <div className="absolute inset-0 tianrong-map" />
              <div className="relative z-10 grid h-full content-between">
                <div>
                  <div className="text-sm font-bold uppercase text-[#536474]">Route planning</div>
                  <h3 className="mt-3 max-w-lg text-3xl font-black text-[#101820]">巡检路线可视化，任务过程可记录、可管理。</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {["A-01", "B-06", "C-12"].map((point, index) => (
                    <div key={point} className="rounded border border-[#C8D2DD] bg-white/80 p-4 backdrop-blur">
                      <div className="text-xs font-bold text-[#667582]">POINT {index + 1}</div>
                      <div className="mt-2 text-2xl font-black text-[#0B5CAD]">{point}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section id="section-3" title={content.processTitle} tone="line">
          <div className="grid gap-3 md:grid-cols-4">
            {content.process.map((step, index) => (
              <div key={step} className="relative rounded border border-[#C9D4DE] bg-white p-5">
                <div className="text-sm font-black text-[#0B5CAD]">{String(index + 1).padStart(2, "0")}</div>
                <div className="mt-8 text-xl font-black text-[#101820]">{step}</div>
                <div className="mt-5 h-1 overflow-hidden rounded bg-[#E3EAF1]">
                  <div className="h-full bg-[#0B5CAD] tianrong-progress" style={{ animationDelay: `${index * 0.12}s` }} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="section-4" title={content.serviceTitle}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {content.services.map(([title, text]) => (
              <article key={title} className="rounded border border-[#DDE3EA] bg-white p-6">
                <h3 className="text-2xl font-black text-[#10283E]">{title}</h3>
                <p className="mt-4 leading-7 text-[#667582]">{text}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="section-5" title={content.experienceTitle} tone="split">
          <div className="grid gap-4 lg:grid-cols-3">
            {content.experiences.map((item, index) => (
              <article key={item} className="min-h-[260px] rounded border border-[#C9D4DE] bg-[#F8FAFC] p-6">
                <div className="text-sm font-black text-[#0B5CAD]">TYPICAL / {index + 1}</div>
                <h3 className="mt-16 text-3xl font-black text-[#101820]">{item}</h3>
                <p className="mt-5 leading-7 text-[#667582]">先作为典型场景方案呈现，后续有真实项目后再替换为客户案例。</p>
              </article>
            ))}
          </div>
        </Section>

        <section className="bg-[#10283E] py-20 text-white">
          <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="text-sm font-bold uppercase text-[#68B7FF]">Contact</div>
              <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">{content.contactTitle}</h2>
            </div>
            <div className="lg:pt-10">
              <p className="text-lg leading-8 text-[#C7D4DF]">{content.contactCopy}</p>
              <Button asChild size="lg" className="mt-8 bg-white text-[#10283E] shadow-none hover:bg-[#E9EEF3]">
                <a href="mailto:contact@tianrongtech.com">
                  {content.contactButton}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#DDE3EA] bg-white py-8">
        <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col gap-3 text-sm text-[#667582] md:flex-row md:items-center md:justify-between">
          <span className="font-bold text-[#10283E]">天戎科技</span>
          <span>机器人巡检与智能安防解决方案供应商。</span>
        </div>
      </footer>
    </div>
  );
}

function Section({
  id,
  title,
  children,
  tone
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  tone?: "dark" | "line" | "split";
}) {
  const dark = tone === "dark";

  return (
    <section id={id} className={dark ? "bg-[#10283E] py-20" : "bg-[#F4F6F8] py-20"}>
      <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
        <div className="mb-10 flex flex-col gap-4 border-t border-[#C9D4DE] pt-6 md:flex-row md:items-end md:justify-between">
          <h2 className={dark ? "max-w-3xl text-4xl font-black leading-tight text-white md:text-5xl" : "max-w-3xl text-4xl font-black leading-tight text-[#101820] md:text-5xl"}>
            {title}
          </h2>
          <div className={dark ? "text-sm font-bold uppercase text-[#68B7FF]" : "text-sm font-bold uppercase text-[#667582]"}>
            Tianrong / Field delivery
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
