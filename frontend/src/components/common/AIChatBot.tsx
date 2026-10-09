/**
 * EduFlow AI Assistant
 * – Remembers the user's name and uses it throughout the conversation
 * – Smart pattern-matching responses for LMS-related questions
 * – Warm amber/orange branding to stand out from the violet app theme
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Send, RotateCcw, ChevronDown,
  BookOpen, Award, Sparkles, Brain,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Msg {
  id: string;
  role: 'user' | 'bot';
  text: string;
  time: Date;
  suggestions?: string[];
}

// ─── Name extractor ───────────────────────────────────────────────────────────
const NOT_NAMES = new Set([
  'the','a','an','not','just','here','good','fine','okay','ok','yes','no','new',
  'old','hi','hello','hey','my','name','is','im','am','call','me','i','this','it',
  'you','we','they','he','she','there','that','what','which','who','how',
]);

function extractName(input: string): string | null {
  const patterns = [
    /(?:my name(?:'?s| is)|i(?:'?m| am)|call me|it(?:'?s| is)|this is|name'?s)\s+([A-Za-z]{2,20})/i,
    /^([A-Z][a-z]{2,})\s*[!.,]?\s*(?:here|speaking)?$/,
    /^hi,?\s*i(?:'?m| am)\s+([A-Za-z]{2,20})/i,
    /^hello,?\s*i(?:'?m| am)\s+([A-Za-z]{2,20})/i,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m?.[1]) {
      const w = m[1].toLowerCase();
      if (!NOT_NAMES.has(w) && w.length >= 2) {
        return m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
      }
    }
  }
  return null;
}

// ─── Response engine ──────────────────────────────────────────────────────────
function respond(
  input: string,
  name: string,        // known name, or '' if not yet introduced
  setName: (n: string) => void
): { text: string; suggestions?: string[] } {
  const q     = input.trim();
  const qLow  = q.toLowerCase();
  const N     = name || 'friend';    // friendly fallback if no name yet
  const hasN  = !!name;

  // ── Detect name introduction ───────────────────────────────────────────────
  const detectedName = extractName(q);
  if (detectedName && !hasN) {
    setName(detectedName);
    return {
      text: `What a great name — **${detectedName}**! 🎉 Nice to meet you!\n\nI'm **EduFlow AI**, your personal learning companion. I'll remember your name throughout our chat.\n\nHow can I help you today, **${detectedName}**? I can recommend courses, track progress, explain certificates, or help you navigate EduFlow!`,
      suggestions: ['Recommend a course for me', 'Show popular courses', 'How do I get started?'],
    };
  }
  if (detectedName && hasN && detectedName !== name) {
    setName(detectedName);
    return {
      text: `Got it! I'll call you **${detectedName}** from now on. 😊\n\nWhat can I help you with, **${detectedName}**?`,
      suggestions: ['Recommend a course', 'My progress', 'How certificates work'],
    };
  }

  // ── Ask for name ───────────────────────────────────────────────────────────
  if (/what(?:'?s| is) my name|do you know (?:my|who i am)/i.test(qLow)) {
    return hasN
      ? { text: `Of course! You're **${name}** 😄 I always remember the people I chat with. Anything else I can help you with?`, suggestions: ['Recommend a course', 'My progress'] }
      : { text: `I don't know your name yet! What should I call you? 😊`, suggestions: [] };
  }

  // ── Greetings ─────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|howdy|sup|yo|good\s*(morning|afternoon|evening)|what'?s up)/i.test(qLow)) {
    const greet = hasN
      ? `Hey **${name}**! 👋 Great to see you again! How's your learning going today?`
      : `Hey there! 👋 I'm **EduFlow AI** — your smart learning companion.\n\nI'd love to know your name! What should I call you?`;
    return {
      text: greet,
      suggestions: hasN
        ? ['Recommend a course', 'My progress', 'I need motivation']
        : ['I\'m [your name]', 'Browse courses', 'How does EduFlow work?'],
    };
  }

  // ── Get started ────────────────────────────────────────────────────────────
  if (/get started|sign up|register|create account|join|new here|how do i (use|begin|start)/i.test(qLow)) {
    return {
      text: `Welcome${hasN ? `, **${name}**` : ''}! Getting started takes less than 60 seconds:\n\n1️⃣ Click **"Start Learning"** top-right\n2️⃣ Create your **free account**\n3️⃣ Browse & **enroll** in any course\n4️⃣ Watch lessons & **track your progress**\n\n✅ Completely **FREE** — no credit card, ever!`,
      suggestions: ['Browse courses', 'What courses are available?', 'Are all courses free?'],
    };
  }

  // ── Course recommendations ─────────────────────────────────────────────────
  if (/recommend|suggest|which course|what (should|can) (i|we)|best course|where (do|should) i start|what to (learn|take)/i.test(qLow)) {
    return {
      text: `Great question${hasN ? `, **${name}**` : ''}! Here are my **top picks for 2026** 🔥\n\n🔵 **Complete React Developer** — #1 for web dev jobs\n🟣 **Python for Data Science & ML** — AI/ML is booming\n☁️ **AWS Cloud & DevOps** — highest salary demand\n🩷 **UI/UX Design Masterclass** — if you love design\n🟢 **Flutter App Development** — build iOS & Android\n\nWhat's your background or goal?`,
      suggestions: ['I\'m a complete beginner', 'I know some coding', 'I want a career change'],
    };
  }

  // ── Beginner path ──────────────────────────────────────────────────────────
  if (/beginner|never coded|no experience|starting from zero|complete newbie/i.test(qLow)) {
    return {
      text: `No worries${hasN ? `, **${name}**` : ''} — everyone starts somewhere! 🌱\n\n**Perfect beginner path:**\n\n1️⃣ **UI/UX Design Masterclass** — No coding needed, learn design thinking\n2️⃣ **Complete React Developer** — Your first coding course (very beginner-friendly)\n3️⃣ **Python for Data Science** — Opens the door to AI & ML\n\n**Why this order?** Design first gives you an eye for good products before you start building them!`,
      suggestions: ['Start with React', 'Start with Design', 'Show me all beginner courses'],
    };
  }

  // ── Specific areas ─────────────────────────────────────────────────────────
  if (/web (dev|development)|react|javascript|frontend|node|html|css/i.test(qLow)) {
    return {
      text: `🔵 Perfect choice${hasN ? `, **${name}**` : ''}! Web Development is the most in-demand skill in 2026.\n\n**Your learning path:**\n\n**Beginner →** Complete React Developer in 2026\n**Backend →** Node.js & Express API Development\n**Full Stack →** Add AWS Cloud & DevOps\n\n💰 Average salary: **$120k/year** for React developers!\n\nShall I tell you more about the React course?`,
      suggestions: ['Tell me about React course', 'Show Node.js course', 'What jobs can I get?'],
    };
  }

  if (/data science|machine learning|python|ai |artificial intelligence|\bml\b/i.test(qLow)) {
    return {
      text: `🟣 Excellent pick${hasN ? `, **${name}**` : ''}! AI & Data Science is the hottest field in 2026.\n\n**Your learning path:**\n\n1️⃣ **Python for Data Science & ML** — Start here\n2️⃣ Master Pandas, NumPy, Matplotlib\n3️⃣ Build real ML models\n4️⃣ Deploy with AWS (use the DevOps course)\n\n🚀 ML engineers earn **$150k+/year**. You're making a smart move!`,
      suggestions: ['Start Python course', 'What is machine learning?', 'Career in data science'],
    };
  }

  if (/cloud|aws|devops|docker|deploy|kubernetes|cicd/i.test(qLow)) {
    return {
      text: `☁️ Cloud & DevOps is on 🔥${hasN ? `, **${name}**` : ''}!\n\nOur **AWS Cloud & DevOps Fundamentals** course covers:\n\n• AWS services — EC2, ECS, RDS, S3, CloudWatch\n• Docker containerization\n• CI/CD pipelines with GitHub Actions\n• Real production deployments\n\n💰 Cloud engineers earn **$130k+/year**. Demand is growing 40% year over year!`,
      suggestions: ['View AWS course', 'What is Docker?', 'Career in Cloud'],
    };
  }

  // ── Progress ───────────────────────────────────────────────────────────────
  if (/progress|how am i|my stats|streak|performance|dashboard/i.test(qLow)) {
    return {
      text: `Your progress awaits${hasN ? `, **${name}**` : ''} 📊\n\nHead to your **Dashboard** to see:\n\n• 📚 Courses enrolled & completed\n• 🔥 Your learning streak\n• ⏱️ Total hours learned\n• 📈 Completion percentages\n• ⚡ AI course recommendations\n\nConsistency is everything — even **15 minutes/day** builds massive skills over time!`,
      suggestions: ['Open Dashboard', 'How to maintain streak?', 'Continue learning'],
    };
  }

  // ── Certificates ───────────────────────────────────────────────────────────
  if (/certificate|certif|badge|credential|proof|linkedin/i.test(qLow)) {
    return {
      text: `🏆 Certificates on EduFlow${hasN ? `, **${name}**` : ''}:\n\n**How to earn one:**\n1. Enroll in any course\n2. Complete **every lesson** (100% progress)\n3. Certificate is issued automatically — free!\n\n**Why it matters:**\n✅ Add to **LinkedIn** profile\n✅ Show employers verified skills\n✅ Stand out in **job applications**\n\nWhich course are you working on?`,
      suggestions: ['View my learning', 'Fastest course to complete', 'Browse all courses'],
    };
  }

  // ── Pricing / free ─────────────────────────────────────────────────────────
  if (/price|cost|free|paid|money|subscription|how much|charge/i.test(qLow)) {
    return {
      text: `🎉 Great news${hasN ? `, **${name}**` : ''} — everything on EduFlow is **completely FREE**!\n\n✅ Unlimited course access\n✅ HD video lessons\n✅ Completion certificates\n✅ Lifetime access\n✅ No credit card, ever\n\nJust create an account and start learning right now!`,
      suggestions: ['Create free account', 'Browse courses', 'Most popular courses'],
    };
  }

  // ── Motivation ─────────────────────────────────────────────────────────────
  if (/motivat|inspire|hard|difficult|stuck|give up|tired|lazy|procrastinat|struggle|not sure/i.test(qLow)) {
    const quotes = [
      `You've got this${hasN ? `, **${name}**`:''}! 💪\n\n"Every expert was once a beginner."\n\nThe fact that you're here means you're already ahead of most people. Take it one lesson at a time — even **15 minutes today** matters more than you think!`,
      `Don't quit${hasN ? `, **${name}**`:''}! 🚀\n\n"Small daily improvements lead to staggering long-term results."\n\nOne lesson. That's all. Just **one lesson today** to keep your streak alive. Your future self will thank you.`,
      `I believe in you${hasN ? `, **${name}**`:''}! 🌟\n\n"You don't have to be great to start, but you have to start to be great." — Zig Ziglar\n\nOpen any course right now and watch just 5 minutes. That's your only goal today.`,
    ];
    return {
      text: quotes[Math.floor(Math.random() * quotes.length)],
      suggestions: ['Open a course', 'Set a study goal', 'Easiest course to finish'],
    };
  }

  // ── Name + thanks ──────────────────────────────────────────────────────────
  if (/thank|thanks|bye|goodbye|see you|that helps|awesome|perfect|great|love it/i.test(qLow)) {
    return {
      text: `You're so welcome${hasN ? `, **${name}**` : ''} 😊\n\nI'm here 24/7 whenever you need help. Keep that learning streak going 🔥\n\n*"The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."*\n\nHappy learning! 🎓`,
      suggestions: ['Continue my courses', 'Browse new courses', 'Back to Dashboard'],
    };
  }

  // ── What is EduFlow ────────────────────────────────────────────────────────
  if (/what is eduflow|about eduflow|tell me about|this platform/i.test(qLow)) {
    return {
      text: `**EduFlow** is a modern Learning Management System (LMS) built for 2026 🎓\n\n**What we offer:**\n• 500+ expert-taught courses\n• Video lessons & text content\n• Hands-on projects\n• Progress tracking & streaks\n• Free certificates\n• AI learning assistant (that's me! 😄)\n\n**Topics:** Web Dev, Data Science, Mobile, Cloud, Design, Business & more!\n\nAll completely free. No catch.`,
      suggestions: ['Browse all courses', 'Create free account', 'Popular courses'],
    };
  }

  // ── How to navigate ────────────────────────────────────────────────────────
  if (/how|navigate|use|find|where|help/i.test(qLow)) {
    return {
      text: `Here's your EduFlow map${hasN ? `, **${name}**` : ''} 🗺️\n\n🏠 **Home** — Discover featured courses\n📚 **Browse** — Search & filter all 500+ courses\n🎓 **Dashboard** — Stats, streak & recommendations\n📖 **My Learning** — All your enrolled courses\n🎬 **Learn** — Watch lessons, take notes, track progress\n👤 **Profile** — Edit account & change password\n\nNeed help with anything specific?`,
      suggestions: ['Browse courses', 'Go to Dashboard', 'How to watch lessons'],
    };
  }

  // ── Video / lessons ────────────────────────────────────────────────────────
  if (/video|watch|play|lesson|notes|keyboard/i.test(qLow)) {
    return {
      text: `🎬 **Watching lessons on EduFlow:**\n\n1. **My Learning** → select a course\n2. Click any lesson in the left sidebar\n3. Video plays (YouTube/Vimeo or text content)\n\n**Keyboard shortcuts while learning:**\n→ or N — Next lesson\n← or P — Previous lesson\nC — Mark lesson complete\nM — Toggle notes panel\n\n📝 The **Notes panel** lets you write & save notes per lesson, then download them!`,
      suggestions: ['Open a course', 'My Learning page', 'Other help'],
    };
  }

  // ── Jobs / career ──────────────────────────────────────────────────────────
  if (/job|career|salary|hire|work|interview|resume|cv/i.test(qLow)) {
    return {
      text: `💼 **2026 Tech Job Market${hasN ? ` for you, ${name}` : ''}:**\n\n🔥 **Hottest skills & salaries:**\n• Full Stack Developer — $110–140k/yr\n• ML Engineer — $130–160k/yr\n• Cloud/DevOps Engineer — $120–150k/yr\n• UI/UX Designer — $85–110k/yr\n\n**EduFlow advantage:** Our certificates are **verifiable** — many learners land jobs within 6 months of completing courses!\n\nWhich career interests you most?`,
      suggestions: ['Web Dev career', 'Data Science career', 'Cloud & DevOps career'],
    };
  }

  // ── Fallback ───────────────────────────────────────────────────────────────
  const fallbacks = [
    `Hmm, I'm not sure about that${hasN ? `, **${name}**` : ''} 🤔 But I can help with:\n\n• 🎯 Course recommendations\n• 📊 Learning progress\n• 🏆 Certificates\n• 🗺️ Platform navigation\n• 💼 Career advice\n\nWhat would you like to explore?`,
    `That's an interesting one${hasN ? `, **${name}**` : ''}! I specialize in learning & career topics. Try asking me:\n\n• "What course should I take?"\n• "How do I earn a certificate?"\n• "What jobs can I get with [skill]?"\n\nOr just describe what you want to learn!`,
  ];
  return {
    text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    suggestions: ['Course recommendations', 'My progress', 'How certificates work'],
  };
}

// ─── Markdown bold renderer ───────────────────────────────────────────────────
function BotText({ text }: { text: string }) {
  return (
    <div className="space-y-1 leading-relaxed text-[13px]">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((p, j) =>
              p.startsWith('**') && p.endsWith('**')
                ? <strong key={j} className="font-semibold text-orange-600 dark:text-amber-400">{p.slice(2, -2)}</strong>
                : <span key={j}>{p}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-end gap-1 px-1 pb-0.5 h-5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-orange-400 dark:bg-amber-400 animate-bounce inline-block"
          style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.75s' }}
        />
      ))}
    </div>
  );
}

// ─── Bot avatar ───────────────────────────────────────────────────────────────
function BotAvatar({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const wh = size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';
  return (
    <div className={`${wh} rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-200/60 dark:shadow-orange-900/40`}>
      <Brain className={size === 'lg' ? 'w-5 h-5 text-white' : 'w-3.5 h-3.5 text-white'} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIChatBot() {
  const { user } = useAuth();

  // If user is logged in, pre-fill name from profile
  const defaultName = user ? user.first_name : '';

  const [open,    setOpen]    = useState(false);
  const [userName, setUserName] = useState(defaultName);
  const [msgs,    setMsgs]    = useState<Msg[]>([]);
  const [input,   setInput]   = useState('');
  const [typing,  setTyping]  = useState(false);
  const [unread,  setUnread]  = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Build welcome message based on whether we know the name
  const buildWelcome = useCallback((name: string): Msg => ({
    id: 'w0',
    role: 'bot',
    text: name
      ? `Hey **${name}**! 👋 I'm **EduFlow AI**, your personal learning companion.\n\nI'm here to help you find the perfect course, track your progress, earn certificates, and navigate the platform.\n\nWhat would you like to explore today?`
      : `Hello! 👋 I'm **EduFlow AI** — your smart learning assistant.\n\nBefore we begin, what's your name? I'd love to make this personal! 😊\n\n*(You can also just ask me anything and skip this!)*`,
    time: new Date(),
    suggestions: name
      ? ['Recommend a course', 'How do I get started?', 'Are courses free?']
      : ['My name is…', 'Browse courses', 'How does EduFlow work?'],
  }), []);

  // Initialize messages once
  useEffect(() => {
    setMsgs([buildWelcome(defaultName)]);
    setUserName(defaultName);
  }, [defaultName]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const sendMsg = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { id: Date.now().toString(), role: 'user', text: text.trim(), time: new Date() };
    setMsgs(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate AI thinking time
    await new Promise(r => setTimeout(r, 700 + Math.random() * 800));

    let capturedName = userName;
    const { text: botText, suggestions } = respond(
      text,
      capturedName,
      (n) => { capturedName = n; setUserName(n); }
    );

    setTyping(false);
    setMsgs(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'bot', text: botText, time: new Date(), suggestions,
    }]);
    if (!open) setUnread(u => u + 1);
  }, [userName, open]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMsg(input); };

  const reset = () => {
    const newName = user ? user.first_name : '';
    setUserName(newName);
    setMsgs([buildWelcome(newName)]);
    setInput('');
  };

  return (
    <>
      {/* ── Floating trigger ─────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(p => !p)}
        aria-label="Open EduFlow AI"
        className={clsx(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl',
          'bg-gradient-to-br from-amber-400 to-orange-500',
          'flex items-center justify-center transition-all duration-300',
          open ? 'rotate-90 scale-95' : 'hover:scale-110 hover:shadow-orange-300/50 dark:hover:shadow-orange-800/60',
          'shadow-orange-300/50 dark:shadow-orange-900/50'
        )}
      >
        {open
          ? <X        className="w-6 h-6 text-white" />
          : <Sparkles className="w-6 h-6 text-white" />}
        {!open && <span className="absolute inset-0 rounded-2xl bg-amber-400 animate-ping opacity-20 pointer-events-none" />}
        {unread > 0 && !open && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-950">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* ── Chat window ──────────────────────────────────────────────── */}
      <div
        className={clsx(
          'fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-1.5rem)]',
          'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl',
          'border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden',
          'transition-all duration-300 origin-bottom-right',
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none',
        )}
        style={{ height: 520 }}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 flex-shrink-0">
          <BotAvatar size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm tracking-tight">EduFlow AI</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-orange-100 text-[11px] font-medium">
                {userName ? `Chatting with ${userName} · Online` : 'Online · Ask me anything'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={reset} title="New conversation"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setOpen(false)} title="Close"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Stats strip ──────────────────────────────────────────── */}
        <div className="flex gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30 flex-shrink-0 overflow-x-auto scrollbar-hide">
          {[
            { icon: BookOpen, label: '500+ Courses', col: 'text-orange-600 dark:text-orange-400' },
            { icon: Award,    label: 'Free Certs',   col: 'text-orange-600 dark:text-orange-400' },
            { icon: Sparkles, label: '2026 AI Picks', col: 'text-orange-600 dark:text-orange-400' },
          ].map(({ icon: Icon, label, col }) => (
            <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-gray-800 rounded-full border border-amber-200 dark:border-amber-900/50 flex-shrink-0">
              <Icon className={`w-3 h-3 ${col}`} />
              <span className={`text-[11px] font-semibold ${col}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Messages ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin">
          {msgs.map(msg => (
            <div key={msg.id}>
              <div className={clsx('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'bot' && <BotAvatar />}
                <div className={clsx(
                  'max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm',
                  msg.role === 'bot'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-none shadow-md shadow-orange-200/40 dark:shadow-orange-900/30'
                )}>
                  {msg.role === 'bot'
                    ? <BotText text={msg.text} />
                    : <p className="text-[13px] leading-relaxed">{msg.text}</p>
                  }
                  <p className={clsx('text-[10px] mt-1.5 text-right', msg.role === 'bot' ? 'text-gray-400 dark:text-gray-500' : 'text-orange-100')}>
                    {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              {/* Quick suggestion chips */}
              {msg.role === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="ml-9 mt-2 flex flex-wrap gap-1.5">
                  {msg.suggestions.map(s => (
                    <button key={s} onClick={() => sendMsg(s)}
                      className="px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-[11px] font-medium rounded-full border border-orange-200 dark:border-orange-800 transition-colors whitespace-nowrap">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-2 justify-start">
              <BotAvatar />
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-200 dark:border-gray-700">
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input ────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}
          className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={userName ? `Ask anything, ${userName}…` : 'Type your name or ask anything…'}
            disabled={typing}
            className="flex-1 h-9 px-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 transition-all"
          />
          <button type="submit" disabled={!input.trim() || typing}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all flex-shrink-0 shadow-md shadow-orange-200/50 dark:shadow-orange-900/30">
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-300 dark:text-gray-600 pb-2 flex-shrink-0">
          EduFlow AI · Powered by Smart Learning Engine · 2026
        </p>
      </div>
    </>
  );
}
