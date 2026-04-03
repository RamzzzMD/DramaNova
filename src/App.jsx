import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Info,
  Flame,
  Home,
  Search,
  ChevronLeft,
  Menu,
  X,
  Star,
  Clock,
  ListVideo,
  MonitorPlay,
} from "lucide-react";

// --- API CONFIGURATION ---
const API_BASE = "https://api.sansekai.my.id/api/dramanova";
const PROXY_URL = "https://drama.sansekai.my.id/api/proxy/video?url=";

// PENTING: Ganti URL di bawah ini dengan URL domain Vercel Backend Anda yang telah berhasil di-deploy!
// Pastikan berakhiran dengan /api/subtitle?url=
const BYPASS_SUBTITLE_API =
  "https://drama-nova-backend.vercel.app/api/subtitle?url=";

const fetchApi = async (endpoint) => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
    return null;
  }
};

// --- ROUTER HELPER ---
const navigate = (path) => {
  window.location.hash = path;
};

// --- COMPONENTS ---

// 1. Navigation Bar
const Navbar = ({ currentPath }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Beranda", path: "/", icon: Home },
    { name: "Hot 18+", path: "/hot", icon: Flame },
  ];

  return (
    <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <MonitorPlay className="h-8 w-8 text-rose-500 mr-2" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-purple-500">
              DramaNova
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const isActive =
                  currentPath === item.path ||
                  (currentPath.startsWith(item.path) && item.path !== "/");
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-800 text-rose-500"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Icon className="w-5 h-5 mr-3 text-rose-500" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

// 2. Drama Card Component
const DramaCard = ({ drama }) => {
  return (
    <div
      className="group relative rounded-xl overflow-hidden cursor-pointer aspect-[3/4] bg-slate-800 shadow-lg hover:shadow-rose-500/20 transition-all duration-300 transform hover:-translate-y-1"
      onClick={() => navigate(`/detail/${drama.dramaId}`)}
    >
      <img
        src={drama.posterImgUrl || drama.posterImg}
        alt={drama.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/300x400?text=No+Image";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

      {/* Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {drama.isCompleted === "1" && (
          <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-rose-600 rounded">
            Tamat
          </span>
        )}
        <span className="px-2 py-1 text-[10px] font-bold text-white bg-slate-900/80 rounded backdrop-blur-sm border border-slate-700">
          Ep {drama.totalEpisodes}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
        <h3 className="text-white font-bold text-sm md:text-base line-clamp-2 leading-tight mb-1">
          {drama.title}
        </h3>
        <div className="flex items-center text-xs text-slate-400 gap-3 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
          <span className="flex items-center">
            <Play className="w-3 h-3 mr-1" />{" "}
            {(drama.viewCount / 1000).toFixed(1)}k
          </span>
          {drama.categoryNames && drama.categoryNames[0] && (
            <span className="px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-300 truncate max-w-[80px]">
              {drama.categoryNames[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. Loading Skeleton
const SkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="aspect-[3/4] rounded-xl bg-slate-800 animate-pulse"
      ></div>
    ))}
  </div>
);

// --- VIEWS ---

// HOME VIEW
const HomeView = () => {
  const [dramas, setDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroDrama, setHeroDrama] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchApi("/home?page=1");
      if (data && data.rows) {
        setDramas(data.rows);
        if (data.rows.length > 0) setHeroDrama(data.rows[0]);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading)
    return (
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        <SkeletonGrid />
      </div>
    );

  return (
    <div className="pb-20">
      {/* Hero Section */}
      {heroDrama && (
        <div className="relative w-full h-[60vh] md:h-[80vh] bg-slate-900">
          <div className="absolute inset-0">
            <img
              src={heroDrama.posterImgUrl || heroDrama.posterImg}
              alt="Hero"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/50 to-transparent"></div>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 max-w-7xl mx-auto flex flex-col justify-end h-full">
            <div className="flex flex-wrap gap-2 mb-3">
              {heroDrama.categoryNames?.slice(0, 3).map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-1 text-xs font-semibold text-rose-400 bg-rose-500/10 rounded-full border border-rose-500/20"
                >
                  {cat}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight">
              {heroDrama.title}
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl line-clamp-3 mb-6 drop-shadow-md">
              {heroDrama.synopsis}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/detail/${heroDrama.dramaId}`)}
                className="flex items-center px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-rose-600/30"
              >
                <Play className="w-5 h-5 mr-2 fill-current" /> Tonton Sekarang
              </button>
              <button
                onClick={() => navigate(`/detail/${heroDrama.dramaId}`)}
                className="flex items-center px-6 py-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg font-bold backdrop-blur-sm transition-colors border border-slate-600"
              >
                <Info className="w-5 h-5 mr-2" /> Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center mb-6">
          <div className="h-8 w-1.5 bg-rose-600 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-white">Rekomendasi Terbaru</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {dramas.slice(1).map((drama) => (
            <DramaCard key={drama.dramaId} drama={drama} />
          ))}
        </div>
      </div>
    </div>
  );
};

// HOT 18+ VIEW
const HotView = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchApi("/drama18?page=1");
      if (data && data.data) {
        setCategories(
          data.data.filter(
            (cat) => cat.recommendModules && cat.recommendModules.length > 0,
          ),
        );
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading)
    return (
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <SkeletonGrid />
      </div>
    );

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-600 flex items-center">
            <Flame className="w-8 h-8 mr-3 text-orange-500" /> Konten Dewasa
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Drama pilihan khusus untuk 18+
          </p>
        </div>
      </div>

      {categories.map((category, idx) => (
        <div key={idx} className="mb-12">
          <div className="flex items-center mb-6">
            <div className="h-6 w-1.5 bg-orange-500 rounded-full mr-3"></div>
            <h2 className="text-xl font-bold text-white capitalize">
              {category.categoryName.replace("dramanova_", "")}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {category.recommendModules.map((drama) => (
              <DramaCard key={drama.dramaId} drama={drama} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// DETAIL VIEW
const DetailView = ({ dramaId }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      const data = await fetchApi(`/detail?dramaId=${dramaId}`);
      if (data && data.data) {
        setDetail(data.data);
      }
      setLoading(false);
    };
    loadDetail();
  }, [dramaId]);

  if (loading)
    return (
      <div className="pt-24 max-w-7xl mx-auto px-4 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );

  if (!detail)
    return (
      <div className="pt-24 text-center text-white">Data tidak ditemukan.</div>
    );

  return (
    <div className="pb-20">
      {/* Detail Header Banner */}
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={detail.posterImgUrl || detail.posterImg}
            alt={detail.title}
            className="w-full h-full object-cover opacity-30 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/40"></div>
        </div>

        <div className="absolute bottom-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 flex flex-col md:flex-row gap-8 items-end relative z-10">
            {/* Poster */}
            <div className="w-32 md:w-56 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black border border-slate-700/50 hidden md:block">
              <img
                src={detail.posterImgUrl || detail.posterImg}
                alt={detail.title}
                className="w-full h-auto"
              />
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-left">
              <button
                onClick={() => window.history.back()}
                className="mb-4 flex items-center text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Kembali
              </button>

              <div className="flex flex-wrap gap-2 mb-3">
                {detail.categories?.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-3 py-1 text-xs font-semibold text-rose-100 bg-rose-600/30 rounded-full border border-rose-500/30 backdrop-blur-sm"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                {detail.title}
              </h1>

              <div className="flex flex-wrap items-center text-sm text-slate-300 gap-4 mb-6">
                <span className="flex items-center">
                  <ListVideo className="w-4 h-4 mr-1 text-rose-500" />{" "}
                  {detail.totalEpisodes} Episode
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-rose-500" />{" "}
                  {detail.publishedAt?.split(" ")[0]}
                </span>
                <span className="flex items-center">
                  <Play className="w-4 h-4 mr-1 text-rose-500" />{" "}
                  {detail.viewCount?.toLocaleString()} Views
                </span>
              </div>

              <div className="flex gap-4">
                {detail.episodes && detail.episodes.length > 0 ? (
                  <button
                    onClick={() =>
                      navigate(
                        `/watch/${dramaId}/${detail.episodes[0].episodeNumber}`,
                      )
                    }
                    className="flex-1 md:flex-none flex items-center justify-center px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-rose-600/30"
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" /> Mulai
                    Menonton
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 md:flex-none px-8 py-3.5 bg-slate-800 text-slate-500 rounded-lg font-bold cursor-not-allowed"
                  >
                    Episode Kosong
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-10">
        {/* Left Column (Synopsis) */}
        <div className="lg:w-1/3">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <Info className="w-5 h-5 mr-2 text-rose-500" /> Sinopsis
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {detail.description || detail.synopsis}
            </p>
          </div>
        </div>

        {/* Right Column (Episodes) */}
        <div className="lg:w-2/3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Daftar Episode</h2>
            <span className="text-slate-400 text-sm">
              {detail.episodes?.length || 0} Episode Tersedia
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {detail.episodes?.map((ep) => (
              <button
                key={ep.id}
                onClick={() =>
                  navigate(`/watch/${dramaId}/${ep.episodeNumber}`)
                }
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-rose-500 hover:bg-slate-700 transition-all group"
              >
                <div className="relative w-full aspect-video bg-slate-900 rounded mb-2 overflow-hidden flex items-center justify-center">
                  <Play className="w-6 h-6 text-slate-600 group-hover:text-rose-500 transition-colors" />
                </div>
                <span className="text-slate-300 group-hover:text-white font-medium text-sm">
                  Episode {ep.episodeNumber}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// WATCH VIEW
const WatchView = ({ dramaId, initialEpNum }) => {
  const [detail, setDetail] = useState(null);
  const [currentEpNum, setCurrentEpNum] = useState(parseInt(initialEpNum));
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [processedTracks, setProcessedTracks] = useState([]);
  const [subtitlesReady, setSubtitlesReady] = useState(false);
  const videoRef = useRef(null);

  // Load drama details to get episode list
  useEffect(() => {
    const loadDetail = async () => {
      const data = await fetchApi(`/detail?dramaId=${dramaId}`);
      if (data && data.data) {
        setDetail(data.data);
      }
    };
    loadDetail();
  }, [dramaId]);

  // Handle URL change for episode navigation
  useEffect(() => {
    setCurrentEpNum(parseInt(initialEpNum));
  }, [initialEpNum]);

  // Load specific video data when currentEpNum changes
  useEffect(() => {
    if (!detail) return;

    const loadVideo = async () => {
      setVideoLoading(true);
      setSubtitlesReady(false);
      const episode = detail.episodes?.find(
        (e) => parseInt(e.episodeNumber) === currentEpNum,
      );

      if (episode && episode.fileId) {
        const vData = await fetchApi(`/getvideo?fileId=${episode.fileId}`);
        if (vData && vData.Result && vData.Result.PlayInfoList) {
          const sortedList = vData.Result.PlayInfoList.sort(
            (a, b) => b.Bitrate - a.Bitrate,
          );

          setVideoData({
            playUrl: sortedList[0].MainPlayUrl,
            subtitleTracks: episode.subtitleTracks || [],
            poster: vData.Result.PosterUrl,
          });
        }
      }
      setVideoLoading(false);
    };

    loadVideo();
  }, [detail, currentEpNum]);

  // Process Subtitles (Ubah format .srt ke .vtt & lewati CORS dengan Backend Proxy)
  useEffect(() => {
    if (!videoData) return;

    let activeBlobUrls = [];
    let isMounted = true;

    const processSubtitles = async () => {
      if (!videoData.subtitleTracks || videoData.subtitleTracks.length === 0) {
        if (isMounted) {
          setProcessedTracks([]);
          setSubtitlesReady(true);
        }
        return;
      }

      const tracks = await Promise.all(
        videoData.subtitleTracks.map(async (track) => {
          try {
            const subUrl = track.label || track.url;
            if (!subUrl) return null;

            let text = "";

            // Strategi 1: Menggunakan endpoint backend Node.js Anda yang mengeksekusi 'bycf'
            try {
              const bypassUrl = `${BYPASS_SUBTITLE_API}${encodeURIComponent(subUrl)}`;
              const res = await fetch(bypassUrl);
              if (!res.ok) throw new Error("Bypass API gagal");
              text = await res.text();
            } catch (e1) {
              // Strategi 2: Coba fetch secara langsung jika backend API gagal
              console.warn("Bypass backend gagal, mencoba direct fetch...");
              const resDirect = await fetch(subUrl);
              if (!resDirect.ok) throw new Error("Direct fetch gagal");
              text = await resDirect.text();
            }

            // Konversi format SRT ke WebVTT (Wajib untuk element <track>)
            if (!text.includes("WEBVTT")) {
              text =
                "WEBVTT\n\n" +
                text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
            }

            const blob = new Blob([text], { type: "text/vtt" });
            const url = URL.createObjectURL(blob);
            activeBlobUrls.push(url);

            return { ...track, vttUrl: url };
          } catch (e) {
            console.error("Gagal memproses subtitle:", e.message || e);
            return null;
          }
        }),
      );

      if (isMounted) {
        setProcessedTracks(tracks.filter(Boolean));
        setSubtitlesReady(true);
      }
    };

    processSubtitles();

    return () => {
      isMounted = false;
      activeBlobUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [videoData]);

  const handleNextEp = () => {
    if (detail && currentEpNum < detail.episodes.length) {
      navigate(`/watch/${dramaId}/${currentEpNum + 1}`);
    }
  };

  const handlePrevEp = () => {
    if (currentEpNum > 1) {
      navigate(`/watch/${dramaId}/${currentEpNum - 1}`);
    }
  };

  if (!detail && loading)
    return (
      <div className="pt-24 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-500"></div>
      </div>
    );

  return (
    <div className="pt-16 min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      {/* Video Area */}
      <div className="w-full lg:w-[70%] xl:w-[75%] flex flex-col">
        <div className="w-full bg-black aspect-video relative group">
          {videoLoading || (videoData && !subtitlesReady) ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 flex-col">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mb-3"></div>
              <span className="text-slate-400 font-medium text-sm">
                Memuat Video & Subtitle...
              </span>
            </div>
          ) : videoData && videoData.playUrl ? (
            <video
              key={videoData.playUrl}
              ref={videoRef}
              className="w-full h-full outline-none"
              controls
              autoPlay
              playsInline
              poster={videoData.poster}
              src={`${PROXY_URL}${encodeURIComponent(videoData.playUrl)}`}
            >
              {processedTracks.map((track, i) => (
                <track
                  key={i}
                  kind="subtitles"
                  src={track.vttUrl}
                  srcLang={track.language === "in" ? "id" : track.language}
                  label="Bahasa Indonesia"
                  default={i === 0}
                />
              ))}
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500">
              Video tidak tersedia.
            </div>
          )}
        </div>

        {/* Video Info & Controls */}
        <div className="p-4 md:p-6 bg-slate-900 border-b border-slate-800 flex-shrink-0">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div>
              <button
                onClick={() => navigate(`/detail/${dramaId}`)}
                className="text-rose-500 text-sm font-semibold hover:underline mb-1"
              >
                {detail?.title}
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Episode {currentEpNum}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevEp}
                disabled={currentEpNum <= 1}
                className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Prev Ep
              </button>
              <button
                onClick={handleNextEp}
                disabled={detail && currentEpNum >= detail.episodes.length}
                className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center"
              >
                Next Ep <Play className="w-3 h-3 ml-1 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Episode Playlist Sidebar */}
      <div className="w-full lg:w-[30%] xl:w-[25%] bg-slate-900 flex flex-col h-[50vh] lg:h-[calc(100vh-64px)] border-l border-slate-800">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <h3 className="font-bold text-white">Daftar Episode</h3>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
            {detail?.episodes?.length || 0} Eps
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
            {detail?.episodes?.map((ep) => {
              const isCurrent = parseInt(ep.episodeNumber) === currentEpNum;
              return (
                <button
                  key={ep.id}
                  onClick={() =>
                    navigate(`/watch/${dramaId}/${ep.episodeNumber}`)
                  }
                  className={`relative p-3 rounded text-center text-sm font-medium transition-all ${
                    isCurrent
                      ? "bg-rose-600 text-white ring-2 ring-rose-500/50 ring-offset-1 ring-offset-slate-900"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                  )}
                  {ep.episodeNumber}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [route, setRoute] = useState({ path: "/", params: {} });

  // Custom Hash Router
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") || "/";
      const parts = hash.split("/").filter(Boolean); // Remove empty strings

      if (parts.length === 0) {
        setRoute({ path: "/", params: {} });
      } else if (parts[0] === "hot") {
        setRoute({ path: "/hot", params: {} });
      } else if (parts[0] === "detail" && parts[1]) {
        setRoute({ path: "/detail", params: { id: parts[1] } });
      } else if (parts[0] === "watch" && parts[1] && parts[2]) {
        setRoute({ path: "/watch", params: { id: parts[1], ep: parts[2] } });
      } else {
        setRoute({ path: "/", params: {} }); // fallback
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Trigger on initial load

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Scroll to top on route change (except watch to watch)
  useEffect(() => {
    if (!route.path.includes("/watch")) {
      window.scrollTo(0, 0);
    }
  }, [route.path]);

  // Global styles for scrollbar
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      body { background-color: #020617; color: white; }
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-rose-500/30">
      <Navbar currentPath={route.path} />

      <main className="min-h-screen">
        {route.path === "/" && <HomeView />}
        {route.path === "/hot" && <HotView />}
        {route.path === "/detail" && <DetailView dramaId={route.params.id} />}
        {route.path === "/watch" && (
          <WatchView dramaId={route.params.id} initialEpNum={route.params.ep} />
        )}
      </main>

      {/* Simple Footer */}
      {!route.path.includes("/watch") && (
        <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center text-slate-500 text-sm">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
            <div className="flex items-center mb-4">
              <MonitorPlay className="h-6 w-6 text-slate-700 mr-2" />
              <span className="text-lg font-bold text-slate-700">
                DramaNova
              </span>
            </div>
            <p>© 2026 DramaNova Streaming. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
