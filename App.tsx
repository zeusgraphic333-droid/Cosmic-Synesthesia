/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { AudioEngine } from './lib/AudioEngine';
import { Experience } from './lib/Experience';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<AudioEngine | null>(null);
  const experienceRef = useRef<Experience | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const audioEngine = new AudioEngine();
    engineRef.current = audioEngine;

    const experience = new Experience(canvasRef.current, audioEngine);
    experienceRef.current = experience;

    return () => {
      experience.dispose();
      audioEngine.pause();
    };
  }, []);

  useEffect(() => {
    if (!started || !containerRef.current || !experienceRef.current || !engineRef.current) return;

    // ScrollTrigger to drive U_TRANSITION and Audio Mix
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        experienceRef.current?.setTransition(progress);
        engineRef.current?.setMix(progress);
      }
    });

    // Animate Typography - Swiss style sharp reveals
    const texts = gsap.utils.toArray('.gsap-reveal');
    texts.forEach((text: any) => {
      gsap.fromTo(text, 
        { y: 50, opacity: 0 },
        { 
          y: 0, opacity: 1, 
          duration: 1.2, 
          ease: "power4.out",
          scrollTrigger: {
            trigger: text,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [started]);

  const handleStart = async () => {
    if (engineRef.current) {
      await engineRef.current.init('https://raw.githubusercontent.com/zeusgraphic333-droid/Cosmic-Synesthesia/main/worry%20(ultra%20slowed)%20(1).mp3', '/order.mp3');
      await engineRef.current.play();
      setStarted(true);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black font-sans text-white overflow-x-hidden selection:bg-white selection:text-black">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <canvas ref={canvasRef} className="w-full h-full outline-none" />
      </div>
      
      {/* Start Overlay */}
      {!started && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 transition-opacity duration-1000 bg-black/90 backdrop-blur-sm">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-center">SYNESTHESIA</h1>
          <p className="max-w-md text-center text-zinc-400 mb-12 text-sm md:text-base font-medium tracking-widest uppercase">
            Primordial Chaos to Mathematical Order
          </p>
          <button 
            onClick={handleStart}
            className="group relative px-12 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white border border-transparent hover:border-white transition-all duration-300"
          >
            Enter Experience / Play Audio
          </button>
        </div>
      )}

      {/* Scrollable Content Overlay */}
      {started && (
        <div ref={containerRef} className="relative z-10 w-full pointer-events-none">
          
          {/* Section 1: Intro (Primordial Chaos) */}
          <section className="min-h-screen w-full flex flex-col justify-end p-8 md:p-16 lg:p-24 overflow-hidden snap-start">
            <div className="gsap-reveal overflow-hidden pointer-events-auto mix-blend-difference">
              <h1 className="text-7xl md:text-[12vw] font-black leading-[0.85] tracking-tighter text-white opacity-90">
                CHAOS.
              </h1>
            </div>
            <div className="gsap-reveal mt-8 max-w-xl pointer-events-auto mix-blend-difference">
              <p className="text-lg md:text-2xl font-medium tracking-tight text-white">
                A study of primordial entropy. Organic algorithms driven by fluid dynamics and abrasive frequencies.
              </p>
            </div>
          </section>

          {/* Section 2: UI/UX Case Studies */}
          <section className="min-h-screen w-full flex flex-col items-end justify-center p-8 md:p-16 lg:p-24 overflow-hidden text-right snap-start">
            <div className="gsap-reveal overflow-hidden pointer-events-auto mix-blend-difference">
              <h2 className="text-6xl md:text-[10vw] font-black leading-none tracking-tighter text-white">
                SYSTEMS.
              </h2>
            </div>
            <div className="gsap-reveal mt-4 md:mt-8 max-w-lg pointer-events-auto mix-blend-difference">
              <p className="text-lg md:text-2xl font-medium tracking-tight text-white">
                Transubstantiating motion into functional logic. Brutalist structural planning meeting raw sensory feedback.
              </p>
            </div>
            <div className="gsap-reveal mt-12 space-y-4 pointer-events-auto w-full max-w-md">
              {['Nexus Protocol', 'Void Architect', 'Synaptic Mesh'].map((project, i) => (
                <div key={i} className="group cursor-pointer border-b-2 border-white/20 pb-4 mix-blend-difference flex justify-between items-center hover:border-white transition-colors duration-300">
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white transition-colors duration-300">
                    {project}
                  </h3>
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    ↗
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Fashion Design */}
          <section className="min-h-screen w-full flex flex-col justify-between p-8 md:p-16 lg:p-24 overflow-hidden bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-auto snap-start">
            <div className="flex-1 flex flex-col justify-center max-w-4xl mt-32">
              <div className="gsap-reveal overflow-hidden mb-6">
                <span className="inline-block px-4 py-2 border-2 border-white text-xs font-black uppercase tracking-widest text-white">
                  Collection 01
                </span>
              </div>
              <div className="gsap-reveal overflow-hidden">
                <h2 className="text-6xl md:text-[8vw] font-black leading-[0.9] tracking-tighter text-white">
                  EREBUS<br />LUXURY APPAREL
                </h2>
              </div>
              <div className="gsap-reveal mt-12 mb-12 border-l-4 border-white pl-8">
                <h3 className="text-2xl md:text-4xl font-bold tracking-tight italic text-white/90">
                  "The Obsession Vow"
                </h3>
              </div>
              <div className="gsap-reveal max-w-2xl">
                <p className="text-lg md:text-xl font-medium tracking-tight text-white/80 leading-relaxed">
                  Mathematical order imposed upon raw textiles. A brutalist commitment to stark silhouettes and flawless topology. The vow is strict structure. The vow is eternal geometry.
                </p>
              </div>
            </div>
            
            <footer className="w-full pt-16 mt-auto border-t-2 border-white/20 flex flex-col md:flex-row justify-between items-start md:items-end text-xs md:text-sm font-bold tracking-widest uppercase text-white/60">
              <div className="gsap-reveal mb-4 md:mb-0">
                Creative Director: Khalid Mohamed
              </div>
              <div className="gsap-reveal text-white/40">
                ID: 2025003620
              </div>
            </footer>
          </section>

        </div>
      )}
    </div>
  );
}
