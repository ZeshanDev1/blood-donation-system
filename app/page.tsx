'use client';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { BrandMark } from '@/components/BrandMark';
import { API_BASE, imageSrc } from '@/lib/api';

interface EventItem {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
}

interface StoryItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [team, setTeam] = useState<any[]>([]);
const [teamLoading, setTeamLoading] = useState(true);

  // Slideshow state
  const [activeStory, setActiveStory] = useState(0);
  const [storyPaused, setStoryPaused] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
  // Fullscreen story lightbox (click image to open & scroll)
  const [lightboxStory, setLightboxStory] = useState<StoryItem | null>(null);
  const slideshowRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Event detail expansion
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  // Mobile nav menu
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const loadEvents = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/public/events`);
        const data = await response.json();
        if (active) setEvents(data.events || []);
      } catch {
        if (active) setEvents([]);
      } finally {
        if (active) setEventsLoading(false);
      }
    };
    loadEvents();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const loadStories = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/public/stories`);
        const data = await response.json();
        if (active) setStories(data.stories || []);
      } catch {
        if (active) setStories([]);
      } finally {
        if (active) setStoriesLoading(false);
      }
    };
    loadStories();
    return () => { active = false; };
  }, []);

  // Auto-advance slideshow
  const advanceSlide = useCallback(() => {
    if (stories.length > 1) {
      setActiveStory((prev) => (prev + 1) % stories.length);
    }
  }, [stories.length]);

  useEffect(() => {
    if (storyPaused || selectedStory || lightboxStory || stories.length <= 1) return;
    slideshowRef.current = setInterval(advanceSlide, 2500);
    return () => { if (slideshowRef.current) clearInterval(slideshowRef.current); };
  }, [storyPaused, selectedStory, lightboxStory, advanceSlide, stories.length]);

  const featuredEvents = useMemo(() => events.slice(0, 6), [events]);

  // Stats counter
  const [donorsCount, setDonorsCount] = useState(0);
  const [livesSaved, setLivesSaved] = useState(0);
  const [successRate, setSuccessRate] = useState(0);

  useEffect(() => {
    let raf: number | null = null;
    const start = Date.now();
    const duration = 1200;
    const from = { d: 0, l: 0, s: 0 };
    const to = { d: 10000, l: 2000, s: 98 };
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      setDonorsCount(Math.round(from.d + (to.d - from.d) * t));
      setLivesSaved(Math.round(from.l + (to.l - from.l) * t));
      setSuccessRate(Math.round(from.s + (to.s - from.s) * t));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, []);

  const toggleEvent = (id: string) => {
    setExpandedEvent((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
  let active = true;

  const loadTeam = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/public/team`);
      const data = await res.json();

      if (active) setTeam(data.team || []);
    } catch {
      if (active) setTeam([]);
    } finally {
      if (active) setTeamLoading(false);
    }
  };

  loadTeam();
  return () => { active = false; };
}, []);



  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl opacity-10" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-red-600/10 rounded-full blur-3xl opacity-10" />
      </div>

      {/* Nav */}
      <nav className="z-50 border-b border-red-900/20 bg-black/50 backdrop-blur-md sticky top-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-6">
          <Link href="/" aria-label="QBDS home" className="group min-w-0 shrink">
            <BrandMark compact showFullName className="origin-left" />
          </Link>

          {/* Center nav links (desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            {[
              { label: 'Mission', href: '#mission' },
              { label: 'Stories', href: '#stories' },
              { label: 'Events', href: '#events' },
              { label: 'Team', href: '#team' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-sm font-semibold text-gray-300 transition-colors duration-300 hover:text-white group/navlink"
              >
                {item.label}
                <span className="absolute bottom-1 left-4 right-4 h-0.5 origin-left scale-x-0 rounded-full bg-red-500 transition-transform duration-300 group-hover/navlink:scale-x-100" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/register" className="hidden sm:block">
              <Button className="bg-red-600 hover:bg-red-700 text-white h-10 px-4 sm:px-6 text-sm font-semibold rounded-lg transition-all shadow-md shadow-red-600/40 hover:shadow-red-600/60">
                Donate Blood
              </Button>
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileNavOpen}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-red-900/30 text-gray-200 hover:bg-red-600/10 hover:text-white transition"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                {mobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden border-t border-red-900/20 bg-black/95 backdrop-blur-md"
            >
              <div className="px-4 py-4 space-y-1">
                {[
                  { label: 'Mission', href: '#mission' },
                  { label: 'Stories', href: '#stories' },
                  { label: 'Events', href: '#events' },
                  { label: 'Team', href: '#team' },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-red-600/10 hover:text-white transition"
                  >
                    {item.label}
                  </a>
                ))}
                <Link href="/register" onClick={() => setMobileNavOpen(false)} className="block pt-2">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white h-11 text-sm font-semibold rounded-lg shadow-md shadow-red-600/40">
                    Donate Blood
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <motion.section
        id="mission"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20 scroll-mt-24 overflow-hidden"
      >
        {/* Campus backdrop with readability fades */}
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <Image
              src="/qims-campus.jpeg"
              alt="Quetta Institute of Medical Sciences campus"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
          {/* light wash for global contrast */}
          <div className="absolute inset-0 bg-black/35" />
          {/* top + bottom fade so it blends into the black page (center stays clear) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          {/* side vignette to focus the centered text */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
          {/* subtle brand-red glow from the bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-red-950/30 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="text-center space-y-8">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="inline-flex mx-auto">
              <div className="px-4 py-2 bg-gradient-to-r from-red-600/20 to-red-600/10 border border-red-600/40 rounded-full text-red-400 text-sm font-semibold backdrop-blur-sm animate-pulse-glow">
                ✨ Save Lives, Every Single Day
              </div>
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight text-balance [text-shadow:0_4px_30px_rgba(0,0,0,0.85)]">
                <span className="inline-block"><span className="text-red-600 [text-shadow:0_4px_30px_rgba(220,38,38,0.5)]">QIMS</span></span>
                <br />
                <span className="inline-block lg:whitespace-nowrap">Blood Donors Society</span>
              </h1>
            </div>

            <p className="text-lg md:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed text-balance [text-shadow:0_2px_16px_rgba(0,0,0,0.9)]">
              Connect compassionate donors with patients in urgent need. Our platform makes blood donation safe, efficient, and impactful.
            </p>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-4 justify-center flex-wrap pt-4">
              <Link href="/register">
                <Button className="bg-red-600 hover:bg-red-700 text-white h-13 px-8 md:px-10 text-base md:text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-red-600/50 hover:shadow-red-600/70 hover:scale-105">
                  Register as Donor
                </Button>
              </Link>
              <Link href="/request">
                <Button variant="outline" className="border-2 border-red-600/60 text-red-600 hover:border-red-600 hover:bg-red-600/10 h-13 px-8 md:px-10 text-base md:text-lg font-semibold rounded-lg transition-all duration-300">
                  Request Blood
                </Button>
              </Link>
              <Link href="/volunteer">
                <Button variant="outline" className="border-2 border-white/30 text-white hover:border-white hover:bg-white/10 h-13 px-8 md:px-10 text-base md:text-lg font-semibold rounded-lg transition-all duration-300">
                  🙋 Volunteer
                </Button>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-12">
              {[
                { label: 'Active Donors', value: donorsCount },
                { label: 'Lives Saved', value: livesSaved },
                { label: 'Success Rate', value: successRate, suffix: '%' },
              ].map((stat, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + idx * 0.1 }} className="modern-card p-6">
                  <div className="space-y-2">
                    <div className="text-4xl md:text-5xl font-black text-red-600">{stat.value.toLocaleString()}{stat.suffix || ''}</div>
                    <p className="text-gray-400 text-sm md:text-base font-medium">{stat.label}</p>
                  </div>
                  <div className="card-glow" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ── STORIES SLIDESHOW ── */}
      <section id="stories" className="relative z-10 py-16 sm:py-24 px-4 border-t border-red-900/20 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-red-500 font-semibold mb-3">Community Stories</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 text-balance">Moments That Matter</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">Gallery of events and activities from our community initiatives</p>
          </motion.div>

          {storiesLoading ? (
            <div className="h-[420px] sm:h-[520px] rounded-3xl border border-red-600/20 bg-gray-900/20 animate-pulse" />
          ) : stories.length === 0 ? (
            <div className="modern-card p-12 text-center rounded-2xl">
              <div className="card-glow" />
              <p className="text-xl text-gray-300 relative z-10">No stories published yet</p>
              <p className="text-gray-400 mt-2 relative z-10">Check back soon for highlights from our community</p>
            </div>
          ) : (
            <div
              className="relative"
              onMouseEnter={() => setStoryPaused(true)}
              onMouseLeave={() => setStoryPaused(false)}
            >
              {/* Main slideshow area */}
              <div className="relative h-[420px] sm:h-[520px] rounded-3xl overflow-hidden border border-red-900/30">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStory}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="absolute inset-0"
                  >
                    <img
                      src={imageSrc(stories[activeStory].imageUrl)}
                      alt={stories[activeStory].title}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                  </motion.div>
                </AnimatePresence>

                {/* Story info — click to open fullscreen scrollable view */}
                <div
                  onClick={() => setLightboxStory(stories[activeStory])}
                  className="absolute inset-0 flex cursor-pointer flex-col justify-end p-8 md:p-12"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStory}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4, delay: 0.15 }}
                      className="max-w-2xl"
                    >
                      <p className="text-xs uppercase tracking-[0.25em] text-red-400 font-semibold mb-2">
                        Story {activeStory + 1} of {stories.length}
                      </p>
                      <h3 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight drop-shadow-lg">
                        {stories[activeStory].title}
                      </h3>
                      <p className="hidden sm:block max-w-xl text-sm md:text-base leading-relaxed text-gray-200 line-clamp-2 drop-shadow">
                        {stories[activeStory].description}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        Click to view full story
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Arrow navigation */}
                <button
                  onClick={() => { setSelectedStory(null); setActiveStory((prev) => (prev - 1 + stories.length) % stories.length); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 border border-white/20 text-white backdrop-blur-sm hover:bg-black/60 transition-all z-10"
                  aria-label="Previous story"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => { setSelectedStory(null); setActiveStory((prev) => (prev + 1) % stories.length); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 border border-white/20 text-white backdrop-blur-sm hover:bg-black/60 transition-all z-10"
                  aria-label="Next story"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Progress bar */}
                <div className="absolute top-0 left-0 right-0 flex gap-1.5 p-4 z-10">
                  {stories.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSelectedStory(null); setActiveStory(idx); }}
                      className="relative flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden"
                    >
                      {idx === activeStory && !storyPaused && !selectedStory && !lightboxStory && (
                        <motion.div
                          className="absolute inset-0 bg-red-500 origin-left"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 4.5, ease: 'linear' }}
                          key={activeStory}
                        />
                      )}
                      {idx < activeStory && (
                        <div className="absolute inset-0 bg-white/70" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thumbnail strip */}
              {stories.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {stories.map((story, idx) => (
                    <button
                      key={story._id}
                      onClick={() => { setActiveStory(idx); setSelectedStory(null); }}
                      className={`relative shrink-0 h-16 w-24 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        idx === activeStory ? 'border-red-500 scale-105' : 'border-white/10 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <img src={imageSrc(story.imageUrl)} alt={story.title} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── STORY LIGHTBOX (fullscreen, scrollable) ── */}
      <AnimatePresence>
        {lightboxStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-black/95 backdrop-blur-sm"
            onClick={() => setLightboxStory(null)}
          >
            {/* Close button (fixed) */}
            <button
              onClick={() => setLightboxStory(null)}
              aria-label="Close"
              className="fixed top-4 right-4 z-[110] flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-red-600/80"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex min-h-full items-start justify-center p-4 py-12 sm:py-16">
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl overflow-hidden rounded-2xl border border-red-900/40 bg-gray-950 shadow-2xl"
              >
                {/* Full image — shown in full, not cropped */}
                <img
                  src={imageSrc(lightboxStory.imageUrl)}
                  alt={lightboxStory.title}
                  className="w-full h-auto object-contain bg-black"
                />

                {/* Story text */}
                <div className="p-6 sm:p-10">
                  <p className="text-xs uppercase tracking-[0.25em] text-red-400 font-semibold mb-3">Community Story</p>
                  <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5">
                    {lightboxStory.title}
                  </h3>
                  <p className="whitespace-pre-line text-base sm:text-lg leading-relaxed text-gray-300">
                    {lightboxStory.description}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EVENTS SECTION ── */}
      <section id="events" className="relative z-10 py-16 sm:py-24 px-4 border-t border-red-900/20 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-16">
            <p className="text-sm uppercase tracking-widest text-red-500 font-semibold mb-3">Community Events</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 text-balance">Upcoming Blood Drives</h2>
            <p className="text-lg text-gray-400 max-w-3xl">Explore live events posted by our team. Every event updates automatically when new drives are scheduled in your area.</p>
          </motion.div>

          {eventsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-96 rounded-2xl border border-red-600/20 bg-gray-900/20 animate-pulse" />
              ))}
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="modern-card p-12 text-center rounded-2xl">
              <div className="card-glow" />
              <p className="text-xl text-gray-300 relative z-10">No events published yet</p>
              <p className="text-gray-400 mt-2 relative z-10">Check back soon for new donation drives</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featuredEvents.map((event, index) => {
                const isExpanded = expandedEvent === event._id;
                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.5 }}
                    className={`group relative h-80 overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 ${
                      isExpanded
                        ? 'border-red-500/60 shadow-xl shadow-red-600/20'
                        : 'border-red-900/30 hover:border-red-600/40'
                    } bg-gray-950`}
                    onClick={() => toggleEvent(event._id)}
                    layout
                  >
                    <AnimatePresence mode="wait">
                      {isExpanded ? (
                        /* ── EXPANDED VIEW (compact description reveal) ── */
                        <motion.div
                          key="expanded"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0"
                        >
                          {/* Blurred dimmed image backdrop */}
                          <img
                            src={imageSrc(event.imageUrl)}
                            alt={event.title}
                            className="absolute inset-0 h-full w-full object-cover scale-105 blur-[2px]"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23222" width="400" height="300"/%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/80" />

                          {/* Close button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedEvent(null); }}
                            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-gray-300 hover:text-white hover:border-white/40 backdrop-blur-sm transition-all"
                            aria-label="Close"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>

                          {/* Content */}
                          <div className="relative z-[1] flex h-full flex-col p-7">
                            <motion.p
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.12, duration: 0.4 }}
                              className="text-[11px] uppercase tracking-[0.2em] text-red-400 font-semibold"
                            >
                              Blood Drive
                            </motion.p>
                            <motion.h3
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.18, duration: 0.4 }}
                              className="mt-1.5 text-xl md:text-2xl font-black text-white leading-tight pr-10"
                            >
                              {event.title}
                            </motion.h3>

                            {/* gradient divider */}
                            <motion.div
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ delay: 0.24, duration: 0.5, ease: 'easeOut' }}
                              className="mt-4 h-0.5 w-16 origin-left rounded-full bg-gradient-to-r from-red-600 to-red-400"
                            />

                            <motion.p
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3, duration: 0.45 }}
                              className="mt-4 flex-1 overflow-y-auto pr-1 text-sm md:text-[15px] leading-relaxed text-gray-200 scrollbar-hide"
                            >
                              {event.description}
                            </motion.p>

                            <motion.button
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4, duration: 0.4 }}
                              onClick={(e) => { e.stopPropagation(); setExpandedEvent(null); }}
                              className="mt-3 inline-flex items-center gap-1.5 self-start text-xs font-semibold text-white/60 hover:text-red-400 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                              Close
                            </motion.button>
                          </div>
                        </motion.div>
                      ) : (
                        /* ── COLLAPSED CARD ── */
                        <motion.div
                          key="collapsed"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="relative h-80"
                        >
                          {/* Full-bleed image */}
                          <img
                            src={imageSrc(event.imageUrl)}
                            alt={event.title}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23222" width="400" height="300"/%3E%3C/svg%3E';
                            }}
                          />
                          {/* Gradient scrim */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10 transition-opacity duration-300 group-hover:from-black/95" />

                          {/* Date badge */}
                          <div className="absolute top-4 left-4 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-red-600/40">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>

                          {/* Expand hint */}
                          <div className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>

                          {/* Bottom info — title, time, location */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 transition-transform duration-300 group-hover:-translate-y-1">
                            <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-red-400 font-semibold">Blood Drive</p>
                            <h3 className="text-xl md:text-2xl font-black text-white leading-tight line-clamp-2 drop-shadow-lg">
                              {event.title}
                            </h3>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-medium text-gray-100 backdrop-blur-sm">
                                <svg className="h-3.5 w-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {event.time}
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-medium text-gray-100 backdrop-blur-sm max-w-[60%]">
                                <svg className="h-3.5 w-3.5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{event.location}</span>
                              </span>
                            </div>

                            <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 group-hover:text-red-400 transition-colors">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                              Click to view details
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="relative z-10 py-16 sm:py-24 px-4 border-t border-red-900/20 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-red-500 font-semibold mb-3">Our Team</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 text-balance">Meet Our Team</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">Dedicated professionals committed to saving lives</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {team.map((member, idx) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: idx * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col items-center text-center"
              >
                {/* Avatar with shiny spinning red border */}
                <div className="team-avatar-float">
                  <div className="team-avatar-ring">
                    <div className="team-avatar-inner">
                      {member.imageUrl ? (
                        <img src={imageSrc(member.imageUrl)} alt={member.name} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-600/40 to-red-900/30 text-5xl font-black text-white/60">
                          {member.name?.charAt(0) ?? '?'}
                        </div>
                      )}
                      <span className="shimmer" />
                    </div>
                  </div>
                </div>

                {/* Name + title */}
                <h4 className="mt-7 text-2xl font-black text-white transition-colors duration-300 group-hover:text-red-500">
                  {member.name}
                </h4>
                <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-red-600/30 bg-red-600/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-red-400">
                  {member.title}
                </p>

                {member.bio && (
                  <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-400">
                    {member.bio}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16 sm:py-24 px-4 border-t border-red-900/20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="modern-card p-12 md:p-16 text-center">
            <div className="card-glow" />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 text-balance">Ready to Make a Difference?</h2>
              <p className="text-lg md:text-xl text-gray-300 mb-8">Join thousands of donors and patients saving lives every single day</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/register">
                  <Button className="bg-red-600 hover:bg-red-700 text-white h-13 px-10 text-lg font-semibold rounded-lg transition-all shadow-lg shadow-red-600/50 hover:shadow-red-600/70 hover:scale-105">Register as Donor</Button>
                </Link>
                <Link href="/request">
                  <Button variant="outline" className="border-2 border-white/30 text-white hover:border-white hover:bg-white/10 h-13 px-10 text-lg font-semibold rounded-lg transition-all">Request Blood</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-red-900/20 bg-gradient-to-b from-black to-gray-950 pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto">

          {/* top grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

            {/* brand column */}
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <BrandMark compact />
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting compassionate donors with patients in urgent need. Building a healthier QIMS community, one donation at a time.
              </p>
              {/* social */}
              <a href="https://www.instagram.com/qims_blood_donor?igsh=N2FsNm80dm5uZ3Rq"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl border border-red-900/25 bg-red-600/5 px-4 py-2.5 text-gray-400 transition hover:border-red-600/60 hover:bg-red-600/15 hover:text-white group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-red-500 group-hover:text-red-400 shrink-0"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Instagram</p>
                  <p className="text-[11px] text-gray-500">@qims_blood_donor</p>
                </div>
                <svg className="h-3 w-3 ml-1 opacity-40 group-hover:opacity-100 transition shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            </div>

            {/* navigation column */}
            <div>
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Navigate</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { label: 'Mission', href: '#mission' },
                  { label: 'Our Team', href: '#team' },
                  { label: 'Events', href: '#events' },
                  { label: 'Community Stories', href: '#stories' },
                ].map(item => (
                  <li key={item.label}>
                    <a href={item.href}
                      className="group flex items-center gap-2 text-gray-400 transition hover:text-red-400">
                      <span className="h-px w-4 bg-red-900/40 transition-all group-hover:w-6 group-hover:bg-red-500" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* get involved column */}
            <div>
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Get Involved</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { label: 'Donate Blood', href: '/register' },
                  { label: 'Request Blood', href: '/request' },
                  { label: 'Volunteer', href: '/volunteer' },
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href}
                      className="group flex items-center gap-2 text-gray-400 transition hover:text-red-400">
                      <span className="h-px w-4 bg-red-900/40 transition-all group-hover:w-6 group-hover:bg-red-500" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* contact column */}
            <div>
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Contact</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-red-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </span>
                  <span>QIMS Campus, Blood Donors Society Office</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="shrink-0 text-red-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.37a16 16 0 006.72 6.72l1.74-1.74a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  </span>
                  <a href="tel:+923308155712" className="hover:text-red-400 transition">+92-330-8155712</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="shrink-0 text-red-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <a href="mailto:qimsblooddonorsociety@gmail.com" className="hover:text-red-400 transition">qimsblooddonorsociety@gmail.com</a>
                </li>
              </ul>
            </div>
          </div>

          {/* bottom bar */}
          <div className="border-t border-red-900/20 pt-8 text-center text-gray-500 text-xs">
            <p>&copy; 2026 QBDS — QIMS Blood Donors Society. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}