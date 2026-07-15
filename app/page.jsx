"use client";

import React, { useState, useEffect } from "react";
import {
  Github,
  Linkedin,
  Mail,
  ArrowUpRight,
  MapPin,
  Atom,
  Brain,
  Terminal,
  X,
  Send,
  Loader2,
  Cloud,
  Sun,
  Moon,
  CloudRain,
  Microscope,
  BookOpen,
} from "lucide-react";
import SpaceBackground from "./SpaceBackground";

// --- Mock Backend / Service Layer ---
const API_SERVICES = {
  fetchWeather: async () => {
    try {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=37.4419&longitude=-122.1430&current=temperature_2m,weather_code&timezone=auto"
      );
      const data = await res.json();
      return {
        temp: Math.round(data.current.temperature_2m),
        code: data.current.weather_code,
      };
    } catch (e) {
      console.error("Weather fetch failed", e);
      return { temp: 72, code: 0 };
    }
  },
  fetchGithubStats: async (username) => {
    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      const data = await res.json();
      return {
        repos: data.public_repos,
        followers: data.followers,
      };
    } catch (e) {
      return { repos: 12, followers: 400 };
    }
  },
};

// --- Components ---
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-3xl w-full max-w-md p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

const Card = ({ children, className = "", hover = true, onClick }) => (
  <div
    onClick={onClick}
    className={`
      bg-white/80 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-white/10 backdrop-blur-md
      rounded-3xl p-6 relative overflow-hidden group
      shadow-sm dark:shadow-none
      ${
        hover
          ? "hover:border-neutral-300 dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/10"
          : ""
      }
      ${onClick ? "cursor-pointer" : ""}
      ${className}
    `}
  >
    {children}
  </div>
);

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 shadow-sm hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
    >
      {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-500" />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

// --- Main Application ---
export default function Home() {
  const [time, setTime] = useState(new Date());
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [weather, setWeather] = useState(null);
  const [githubStats, setGithubStats] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  // Sync theme from DOM (set by layout script) after mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    API_SERVICES.fetchWeather().then(setWeather);
    API_SERVICES.fetchGithubStats("JazzikPeng").then(setGithubStats);
  }, []);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const subject = `New Message from ${formData.name}`;
    const body = `Name: ${formData.name}%0AEmail: ${formData.email}%0A%0A${formData.message}`;
    window.location.href = `mailto:hello@example.com?subject=${subject}&body=${body}`;
    setIsContactOpen(false);
    setFormData({ name: "", email: "", message: "" });
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="text-yellow-500" size={24} />;
    if (code > 0 && code < 3) return <Cloud className="text-neutral-400" size={24} />;
    return <CloudRain className="text-blue-400" size={24} />;
  };

  const projects = [
    {
      title: "Neural Hamiltonian",
      desc: "Recovering physical laws from video data using GNNs.",
      tags: ["PyTorch", "Physics", "AI"],
      link: "#",
      color: "bg-indigo-500",
    },
    {
      title: "Quantum Sim",
      desc: "Simulating qubit entanglement on classical GPU hardware.",
      tags: ["CUDA", "Python", "Quantum"],
      link: "#",
      color: "bg-cyan-500",
    },
    {
      title: "Entropy Flow",
      desc: "Generative models for thermodynamic system modeling.",
      tags: ["JAX", "Research"],
      link: "#",
      color: "bg-rose-500",
    },
  ];

  const blogs = [
    {
      title: "Understanding Physics-Informed Neural Networks",
      date: "Oct 12, 2024",
      readTime: "5 min read",
      link: "#",
      desc: "How we can embed physical laws directly into loss functions.",
    },
    {
      title: "The State of Quantum Computing in 2024",
      date: "Sep 28, 2024",
      readTime: "8 min read",
      link: "#",
      desc: "Why error correction is still the biggest hurdle.",
    },
    {
      title: "Generative AI for Molecular Discovery",
      date: "Aug 15, 2024",
      readTime: "6 min read",
      link: "#",
      desc: "Accelerating drug discovery pipelines with diffusion models.",
    },
  ];

  const isDark = theme === "dark";
  const ambientColor = isDark
    ? "rgba(100, 140, 255, 0.07)"
    : "rgba(99, 102, 241, 0.10)";

  return (
    <div
      className="relative min-h-screen bg-transparent text-neutral-800 dark:text-neutral-200 font-sans selection:bg-purple-500/30 selection:text-purple-700 dark:selection:text-purple-200 pb-20 transition-colors duration-300"
      onMouseMove={handleMouseMove}
    >
      {/* Space backdrop: nebula + starfield + meteors */}
      <SpaceBackground mousePos={mousePos} theme={theme} />

      {/* Cursor spotlight */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-500"
        style={{
          background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, ${ambientColor}, transparent 42%)`,
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
              Zhejian(Jazzik){" "}
              <span className="text-neutral-400 dark:text-neutral-600">Peng</span>
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-lg leading-relaxed">
              Recsys & generative AI at{" "}
              <strong className="font-semibold text-neutral-800 dark:text-neutral-200">SpaceXAI</strong>
              {" — "}research to production.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-neutral-500 font-mono text-sm">Open to collaboration</span>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[180px]">
          {/* 1. Bio — compact */}
          <Card className="md:col-span-2 lg:col-span-2 row-span-2 flex flex-col overflow-hidden bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-900">
            <div className="absolute top-0 right-0 p-5 opacity-[0.08] text-neutral-900 dark:text-white pointer-events-none">
              <Brain size={100} />
            </div>
            <div className="relative z-10 flex h-full flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center border border-neutral-200 dark:border-white/5 shrink-0">
                  <span className="text-xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white leading-tight">
                    About Me
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500">
                    Production AI · RecSys · Infra
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 flex-1 content-start">
                {[
                  { org: "SpaceXAI", role: "Phoenix recsys" },
                  { org: "Snap", role: "Ads · LLM · Patent" },
                  { org: "TikTok", role: "Recsys · 1M QPS" },
                  { org: "Walmart", role: "Forecast · Patent" },
                ].map((item) => (
                  <div
                    key={item.org}
                    className="rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50/80 dark:bg-white/[0.03] px-3 py-2.5"
                  >
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {item.org}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                      {item.role}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-1.5 flex-wrap pt-0.5">
                {["2 Patents", "NeurIPS / ICML", "UIUC · GT · Stanford"].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 text-[11px] text-neutral-600 dark:text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* 2. Live Weather */}
          <Card className="md:col-span-1 row-span-1 flex flex-col justify-center items-center relative group overflow-hidden">
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
              <div className="w-full h-full bg-[radial-gradient(#a3a3a3_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-3 animate-bounce-slow">
                {weather ? getWeatherIcon(weather.code) : <Loader2 className="animate-spin" />}
              </div>
              <span className="font-bold text-neutral-900 dark:text-white text-2xl">
                {weather ? `${weather.temp}°F` : "--"}
              </span>
              <div className="flex items-center gap-1 text-xs text-neutral-500 font-mono mt-1">
                <MapPin size={10} /> Palo Alto, CA
              </div>
            </div>
          </Card>

          {/* 3. Twitter/X */}
          <Card
            className="md:col-span-1 row-span-1 flex flex-col justify-between group cursor-pointer"
            onClick={() => window.open("https://x.com/zjpeng94", "_blank")}
          >
            <div className="flex justify-between items-start">
              <div className="p-2 bg-neutral-100 dark:bg-white/5 rounded-lg text-neutral-900 dark:text-white group-hover:bg-black group-hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </div>
              <ArrowUpRight
                className="text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors"
                size={20}
              />
            </div>
            <div>
              <div className="font-bold text-neutral-900 dark:text-white">X</div>
              <div className="text-xs text-neutral-500">@zjpeng94</div>
            </div>
          </Card>

          {/* 4. LinkedIn */}
          <Card
            className="md:col-span-1 lg:col-span-1 row-span-1 flex flex-col justify-between group cursor-pointer"
            onClick={() => window.open("https://www.linkedin.com/in/zhejian-peng/", "_blank")}
          >
            <div className="flex justify-between items-start">
              <div className="p-2 bg-neutral-100 dark:bg-white/5 rounded-lg text-neutral-900 dark:text-white group-hover:bg-[#0077b5] group-hover:text-white transition-colors">
                <Linkedin size={24} />
              </div>
              <ArrowUpRight
                className="text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors"
                size={20}
              />
            </div>
            <div>
              <div className="font-bold text-neutral-900 dark:text-white">LinkedIn</div>
              <div className="text-xs text-neutral-500">Professional Profile</div>
            </div>
          </Card>

          {/* 5. Blog / Writings */}
          <Card
            className="md:col-span-1 lg:col-span-1 row-span-1 flex flex-col justify-between group cursor-pointer"
            onClick={() => setIsBlogOpen(true)}
          >
            <div className="flex justify-between items-start">
              <div className="p-2 bg-neutral-100 dark:bg-white/5 rounded-lg text-neutral-900 dark:text-white group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <BookOpen size={24} />
              </div>
              <ArrowUpRight
                className="text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors"
                size={20}
              />
            </div>
            <div>
              <div className="font-bold text-neutral-900 dark:text-white">Writings</div>
              <div className="text-xs text-neutral-500 mt-1">Thoughts on AI & Physics</div>
            </div>
          </Card>

          {/* 6. Projects */}
          <Card className="md:col-span-2 lg:col-span-2 row-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <Brain size={20} className="text-purple-500 dark:text-purple-400" />
                Research & Works
              </h3>
              <a
                href="#"
                className="text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                View All &rarr;
              </a>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {projects.map((project, idx) => (
                <div
                  key={idx}
                  className="group/item flex items-center gap-4 p-3 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 ${project.color} rounded-lg bg-opacity-20 flex items-center justify-center shrink-0 text-white`}
                  >
                    <Microscope size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-neutral-900 dark:text-white font-medium group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-sm text-neutral-500 truncate">{project.desc}</p>
                  </div>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <ArrowUpRight size={16} className="text-neutral-400" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 7. Stack */}
          <Card className="md:col-span-1 row-span-1 flex flex-col justify-between group">
            <div className="p-2 bg-neutral-100 dark:bg-white/5 w-fit rounded-lg text-orange-500 dark:text-orange-400 mb-2">
              <Terminal size={24} />
            </div>
            <div>
              <div className="font-bold text-neutral-900 dark:text-white">The Stack</div>
              <div className="text-xs text-neutral-500 mt-1">
                PyTorch, JAX, CUDA, Python, TensorFlow
              </div>
            </div>
          </Card>

          {/* 8. Github */}
          <Card
            className="md:col-span-1 row-span-1 flex flex-col justify-between group cursor-pointer"
            onClick={() => window.open("https://github.com/JazzikPeng", "_blank")}
          >
            <div className="flex justify-between items-start">
              <div className="p-2 bg-neutral-100 dark:bg-white/5 rounded-lg text-neutral-900 dark:text-white group-hover:bg-neutral-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors">
                <Github size={24} />
              </div>
              <ArrowUpRight
                className="text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors"
                size={20}
              />
            </div>
            <div>
              <div className="font-bold text-neutral-900 dark:text-white">GitHub</div>
              <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                <span>{githubStats ? githubStats.repos : "--"} Repos</span>
                <span>{githubStats ? githubStats.followers : "--"} Followers</span>
              </div>
            </div>
          </Card>

          {/* 9. Contact Modal Trigger */}
          <Card
            className="md:col-span-2 row-span-1 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => setIsContactOpen(true)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-900 dark:text-white">
                <Mail size={20} />
              </div>
              <div>
                <div className="font-bold text-neutral-900 dark:text-white">Get in touch</div>
                <div className="text-sm text-neutral-500">hello@example.com</div>
              </div>
            </div>
            <div className="px-4 py-2 rounded-full bg-neutral-100 dark:bg-white/5 text-sm font-medium text-neutral-900 dark:text-white border border-neutral-200 dark:border-white/10 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              Send Message
            </div>
          </Card>

          {/* 10. Visualizations */}
          <Card className="md:col-span-2 lg:col-span-2 row-span-1 relative group overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2670&auto=format&fit=crop"
              alt="Physics Simulation"
              className="absolute inset-0 w-full h-full object-cover opacity-50 dark:opacity-40 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 dark:from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <div className="flex items-center gap-2 text-white mb-1">
                <Atom size={16} />
                <span className="font-bold">Simulations</span>
              </div>
              <p className="text-sm text-neutral-200 dark:text-neutral-400">
                Visualizing high-dimensional data manifolds.
              </p>
            </div>
          </Card>
        </div>

        <footer className="mt-20 border-t border-neutral-200 dark:border-white/10 pt-8 pb-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} Zhejian(Jazzik) Peng. All rights reserved.</p>
          <div className="flex gap-6">
            <a
              href="https://x.com/zjpeng94"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              X
            </a>
            <a
              href="https://www.linkedin.com/in/zhejian-peng/"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/JazzikPeng"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </footer>
      </div>

      {/* Blog Modal */}
      <Modal isOpen={isBlogOpen} onClose={() => setIsBlogOpen(false)}>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Latest Writings</h2>
        <div className="flex flex-col gap-4">
          {blogs.map((post, idx) => (
            <a
              key={idx}
              href={post.link}
              className="group flex flex-col gap-1 p-4 rounded-xl bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors border border-neutral-200 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                  {post.title}
                </h3>
                <ArrowUpRight
                  size={16}
                  className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{post.desc}</p>
              <div className="flex gap-3 text-xs text-neutral-500 font-mono mt-2">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
            </a>
          ))}
        </div>
      </Modal>

      {/* Contact Modal */}
      <Modal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)}>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
          Let&apos;s work together
        </h2>
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">
              NAME
            </label>
            <input
              required
              type="text"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 rounded-lg p-3 text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">
              EMAIL
            </label>
            <input
              required
              type="email"
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 rounded-lg p-3 text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-1">
              MESSAGE
            </label>
            <textarea
              required
              rows={4}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 rounded-lg p-3 text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
              placeholder="Tell me about your project..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-neutral-900 dark:bg-white text-white dark:text-black font-bold py-3 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
          >
            <Send size={18} />
            Send Message
          </button>
        </form>
      </Modal>
    </div>
  );
}
