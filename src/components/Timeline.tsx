import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface TimelineItem {
  date: string;
  title: string;
  company?: string;
  companyUrl?: string;
  period?: string;
  summary: string;
  tags: string[];
}

const timelineData: TimelineItem[] = [
  {
    date: "MAY 2025 – JULY 2025",
    title: "Software Engineering Intern",
    company: "SafeSpace",
    period: "May 2025 – Jul 2025",
    summary:
      "Developed a multimodal stress detection system fusing physiological signals, facial expressions, and audio with 94.1% accuracy. Designed an Agreement-Aware Fusion algorithm for dynamic model weighting.",
    tags: ["Python", "TensorFlow", "Deep Learning", "CNN", "LLM"],
  },
  {
    date: "JAN 2024 – PRESENT",
    title: "Head of Logistics",
    company: "Mudra Cultural Society, Thapar Institute",
    period: "Jan 2024 – Present",
    summary:
      "Managed logistics for flagship college events with 1000+ attendees, coordinating vendors and team operations. Optimized resource allocation resulting in 20% cost reduction.",
    tags: ["Leadership", "Logistics", "Operations", "Event Planning"],
  },
  {
    date: "AUG 2023 – PRESENT",
    title: "Head of Logistics",
    company: "MUN Society, Thapar Institute",
    period: "Aug 2023 – Present",
    summary:
      "Coordinated MUN simulations for 300+ delegates, managing schedules and venue arrangements. Streamlined registration process and improved participant satisfaction by 25%.",
    tags: ["Coordination", "Management", "Public Relations"],
  },
];

const Timeline = () => {
  const { ref, isVisible } = useScrollAnimation();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleItems, setVisibleItems] = useState(1);
  const scrollAccumulator = useRef(0);
  const [hasPassedProjects, setHasPassedProjects] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;

      if (elementTop < windowHeight && elementTop > -elementHeight) {
        const progress = Math.max(
          0,
          Math.min(100, ((windowHeight - elementTop) / (windowHeight + elementHeight)) * 100)
        );
        setScrollProgress(progress);
      }

      // One-time check: if user has scrolled past the #projects section, mark flag
      if (!hasPassedProjects) {
        const projectsEl = document.getElementById('projects') || document.querySelector('[data-section="projects"]') as HTMLElement | null;
        if (projectsEl) {
          const projBottom = projectsEl.getBoundingClientRect().bottom + window.scrollY;
          if (window.scrollY > projBottom) {
            setHasPassedProjects(true);
            setVisibleItems(timelineData.length);
            setScrollProgress(100);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!timelineRef.current) return;
      
      // Only apply scroll-jacking on desktop (lg breakpoint = 1024px)
      if (window.innerWidth < 1024) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const isInView = rect.top <= 100 && rect.bottom >= window.innerHeight / 2;

      if (isInView && visibleItems < timelineData.length) {
        e.preventDefault();

        scrollAccumulator.current += e.deltaY;

        if (Math.abs(scrollAccumulator.current) > 100) {
          if (scrollAccumulator.current > 0 && visibleItems < timelineData.length) {
            setVisibleItems((prev) => Math.min(prev + 1, timelineData.length));
          } else if (scrollAccumulator.current < 0 && visibleItems > 1) {
            setVisibleItems((prev) => Math.max(prev - 1, 1));
          }
          scrollAccumulator.current = 0;
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [visibleItems]);

  return (
    <section
      ref={timelineRef}
      className="py-0 px-6 lg:px-8 relative overflow-hidden"
      id="timeline"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div ref={ref} className={`${isVisible ? "scroll-animate" : "opacity-0"} flex items-center justify-center gap-8 mb-20 flex-wrap`}>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center">
           Tracing the Arc...
          </h2>
        </div>

        {/* Desktop Timeline - Horizontal */}
        <div className="hidden lg:block relative">
          {/* Background Line */}
          <div className="absolute top-10 left-0 right-0 h-0.5 bg-border" />
          
          {/* Animated Progress Line */}
          <div
            className="absolute top-10 left-0 h-0.5 bg-gradient-to-r from-accent via-primary to-accent transition-all duration-300 ease-out"
            style={{ width: `${(visibleItems / timelineData.length) * 100}%` }}
          />

          {/* Timeline Items */}
          <div className="grid grid-flow-col auto-cols-fr gap-8 relative items-stretch">
            {timelineData.map((item, index) => (
              <div
                key={index}
                className={`relative flex flex-col transition-all duration-700 ${
                  index < visibleItems ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
              >
                {/* Dot Container - Line passes through center */}
                <div className="relative h-20 flex items-center justify-center">
                  <div
                    className={`w-4 h-4 rounded-full border-2 z-10 transition-all duration-500 ${
                      index < visibleItems
                        ? "bg-accent border-accent shadow-lg shadow-accent/50 scale-125"
                        : "bg-background border-border"
                    }`}
                  />
                </div>

                {/* Content Card */}
                <div className="glass-card flex-1 p-5 rounded-xl group cursor-default border border-black/60 dark:border-gray-400 transition-transform duration-200 ease-out transform hover:-translate-y-1 hover:shadow-lg bg-white/5 dark:bg-white/3 backdrop-blur-sm flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{item.period || item.date}</p>
                      <div className="mt-2 flex items-start justify-between gap-3">
                        <h3 className="text-xl font-bold text-foreground leading-snug">{item.title}</h3>
                      </div>
                      {item.company && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.companyUrl ? (
                            <a href={item.companyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline relative pr-6">
                              <span>{item.company}</span>
                              <ArrowRight className="absolute top-0 right-0 w-5 h-5 -rotate-45 text-accent" />
                            </a>
                          ) : (
                            <>{item.company}</>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted/80 text-foreground font-medium dark:bg-muted/70 dark:text-foreground"
                        style={{ borderRadius: '9999px' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline - Vertical */}
        <div className="lg:hidden relative pl-8">
          {/* Background Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          
          {/* Animated Progress Line */}
          <div
            className="absolute left-4 top-0 w-0.5 bg-gradient-to-b from-accent via-primary to-accent transition-all duration-300 ease-out"
            style={{ height: `${scrollProgress}%` }}
          />

          {/* Timeline Items */}
          <div className="space-y-12">
            {timelineData.map((item, index) => (
              <div
                key={index}
                className={`relative ${
                  isVisible ? `scroll-animate scroll-animate-delay-${index + 1}` : "opacity-0"
                }`}
              >
                {/* Dot */}
                <div className="absolute -left-[26px] top-0">
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                      scrollProgress > (index / (timelineData.length - 1)) * 100
                        ? "bg-accent border-accent shadow-lg shadow-accent/50 scale-125"
                        : "bg-background border-border"
                    }`}
                  />
                </div>

                {/* Content Card */}
                <div className="glass-card p-6 rounded-xl group cursor-default border border-black/60 dark:border-gray-400 ml-4">
                  <p className="text-sm text-muted-foreground">{item.period || item.date}</p>
                  <h3 className="text-xl font-bold mb-1 text-foreground">{item.title}</h3>
                  {item.company && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.companyUrl ? (
                        <a href={item.companyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline relative pr-6">
                          <span>{item.company}</span>
                          <ArrowRight className="absolute top-0 right-0 w-5 h-5 -rotate-45 text-accent" />
                        </a>
                      ) : (
                        <>{item.company}</>
                      )}
                    </p>
                  )}

                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted/80 text-foreground font-medium dark:bg-muted/70 dark:text-foreground"
                        style={{ borderRadius: '9999px' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
