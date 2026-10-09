import { useState } from 'react';
import { Play, Volume2, ExternalLink, Film } from 'lucide-react';

type VideoKind = 'youtube' | 'vimeo' | 'html5' | 'none';

function detect(url: string): VideoKind {
  if (!url) return 'none';
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/vimeo\.com/.test(url)) return 'vimeo';
  if (/\.(mp4|webm|ogg)(\?|$)/.test(url)) return 'html5';
  return 'none';
}

function ytId(url: string) {
  return (
    url.match(/youtu\.be\/([^?&]+)/)?.[1] ??
    url.match(/[?&]v=([^&]+)/)?.[1] ??
    url.match(/\/embed\/([^?]+)/)?.[1] ?? ''
  );
}

function vimeoId(url: string) {
  return url.match(/vimeo\.com\/(\d+)/)?.[1] ?? '';
}

interface Props {
  videoUrl?: string | null;
  title?: string;
  /** Called when video ends */
  onEnd?: () => void;
}

export default function VideoPlayer({ videoUrl, title = 'Lesson video', onEnd }: Props) {
  const [started, setStarted] = useState(false);

  if (!videoUrl) return null;

  const kind = detect(videoUrl);

  /* ── YouTube ─────────────────────────────────────────────────────────────── */
  if (kind === 'youtube') {
    const id = ytId(videoUrl);
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
        {!started ? (
          <button
            onClick={() => setStarted(true)}
            className="relative w-full h-full group"
            aria-label="Play video"
          >
            {/* thumbnail */}
            <img
              src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`}
              alt={title}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`; }}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-red-600 group-hover:bg-red-500 transition-colors flex items-center justify-center shadow-2xl">
                <Play className="w-9 h-9 text-white fill-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white text-sm font-medium">
              <Film className="w-4 h-4" />
              <span>YouTube · Click to play</span>
            </div>
          </button>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        )}
      </div>
    );
  }

  /* ── Vimeo ───────────────────────────────────────────────────────────────── */
  if (kind === 'vimeo') {
    const id = vimeoId(videoUrl);
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
        <iframe
          src={`https://player.vimeo.com/video/${id}?color=7c3aed&title=0&byline=0&portrait=0`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  /* ── HTML5 ───────────────────────────────────────────────────────────────── */
  if (kind === 'html5') {
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
        <video
          src={videoUrl}
          controls
          className="w-full h-full"
          onEnded={onEnd}
        >
          <p className="text-white p-4">
            Your browser doesn't support HTML5 video.{' '}
            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="underline">
              Download the video
            </a>
          </p>
        </video>
      </div>
    );
  }

  /* ── Unknown / external link ─────────────────────────────────────────────── */
  return (
    <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-violet-900 to-indigo-900 flex flex-col items-center justify-center gap-4 shadow-2xl">
      <Volume2 className="w-12 h-12 text-violet-300" />
      <p className="text-white font-medium">External video resource</p>
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-medium border border-white/20"
      >
        <ExternalLink className="w-4 h-4" /> Open video
      </a>
    </div>
  );
}
