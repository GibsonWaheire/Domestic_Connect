import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Loader2, Users, MessageCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { API_BASE_URL } from '@/lib/apiConfig';
import { Header } from '@/components/employer/Header';

const CATEGORIES = [
  'Housegirl / House Manager',
  'Gardener',
  'Gateman / Security',
  'Nurse / Caregiver',
  'Daily Casual',
];
const COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret / Uasin Gishu',
  'Machakos', 'Kiambu', 'Kajiado', 'Nyeri', 'Muranga', 'Thika',
  'Meru', 'Kakamega', 'Kilifi', 'Kwale', 'Other',
];
const LIVE_IN_OPTIONS = [
  { val: 'live_in', label: 'Live-in' },
  { val: 'live_out', label: 'Live-out' },
  { val: 'flexible', label: 'Flexible' },
];

const CATEGORY_ICONS: Record<string, string> = {
  'Housegirl / House Manager': '🏠',
  'Gardener': '🌿',
  'Gateman / Security': '🔐',
  'Nurse / Caregiver': '❤️',
  'Daily Casual': '🔧',
};

type Worker = {
  id: string;
  display_name: string;
  category: string;
  county: string;
  experience: string;
  live_in: string;
  bio: string;
  profile_photo_url: string;
  verification_status: string;
};

const WorkersMarketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [countyFilter, setCountyFilter] = useState('');
  const [liveInFilter, setLiveInFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, [categoryFilter, countyFilter, liveInFilter]);

  const fetchWorkers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await FirebaseAuthService.getIdToken().catch(() => null);
      const params = new URLSearchParams();
      if (categoryFilter) params.set('category', categoryFilter);
      if (countyFilter) params.set('county', countyFilter);
      if (liveInFilter) params.set('live_in', liveInFilter);

      const res = await fetch(`${API_BASE_URL}/api/workers/?${params.toString()}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) {
        if (res.status === 403) { setError('Please log in as an employer to view workers.'); return; }
        throw new Error('Failed to load workers');
      }
      const data = await res.json();
      setWorkers(data.workers || []);
    } catch (e: any) {
      setError(e.message || 'Could not load workers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = workers.filter(w => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return w.display_name.toLowerCase().includes(s)
      || w.category.toLowerCase().includes(s)
      || w.county.toLowerCase().includes(s)
      || w.bio.toLowerCase().includes(s);
  });

  const liveInLabel = (val: string) => {
    if (val === 'live_in') return 'Live-in';
    if (val === 'live_out') return 'Live-out';
    return 'Flexible';
  };

  const initials = (name: string) =>
    name.split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase() || 'W';

  const activeFilters = [categoryFilter, countyFilter, liveInFilter].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Browse Verified Workers | Domestic Connect Kenya</title>
        <meta name="description" content="Browse our vetted domestic workers — housegirls, gardeners, gatemen, nurses and casual workers across Kenya." />
      </Helmet>

      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Available Workers</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Vetted domestic workers ready for placement. Contact us to request any worker.
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button"
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${showFilters ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}>
              <Filter size={15} />
              Filters {activeFilters > 0 && <span className="bg-white text-teal-700 rounded-full px-1.5 text-xs font-bold">{activeFilters}</span>}
            </button>
            <button type="button" onClick={() => navigate('/employer-dashboard')}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-300">
              Dashboard
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, category or county…"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Category</label>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white">
                <option value="">All categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">County</label>
              <select value={countyFilter} onChange={e => setCountyFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white">
                <option value="">All counties</option>
                {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Live-in</label>
              <select value={liveInFilter} onChange={e => setLiveInFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white">
                <option value="">Any</option>
                {LIVE_IN_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
              </select>
            </div>
            {activeFilters > 0 && (
              <div className="sm:col-span-3 flex justify-end">
                <button type="button" onClick={() => { setCategoryFilter(''); setCountyFilter(''); setLiveInFilter(''); }}
                  className="text-xs text-red-600 hover:underline">Clear all filters</button>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
            <Loader2 size={32} className="animate-spin" />
            <p className="text-sm">Loading workers…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700 text-sm font-medium">{error}</p>
            <button type="button" onClick={fetchWorkers} className="mt-3 text-sm text-red-600 hover:underline">Retry</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Users size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">No workers match your filters.</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting the filters or check back later as we add more verified workers.</p>
          </div>
        )}

        {/* Worker grid */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-4">{filtered.length} worker{filtered.length !== 1 ? 's' : ''} available</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(w => (
                <div key={w.id} className="rounded-xl border border-gray-200 bg-white p-5 hover:border-teal-300 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-3 mb-4">
                    {w.profile_photo_url ? (
                      <img src={w.profile_photo_url} alt={w.display_name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-100 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {initials(w.display_name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{w.display_name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <span>{CATEGORY_ICONS[w.category] || '👤'}</span>
                        <span className="truncate">{w.category}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {w.county && (
                      <span className="rounded-full bg-gray-100 text-gray-600 px-2.5 py-0.5 text-xs font-medium">
                        📍 {w.county}
                      </span>
                    )}
                    {w.live_in && (
                      <span className="rounded-full bg-teal-50 text-teal-700 px-2.5 py-0.5 text-xs font-medium">
                        {liveInLabel(w.live_in)}
                      </span>
                    )}
                    {w.experience && (
                      <span className="rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5 text-xs font-medium">
                        {w.experience === '0' ? '<1 yr' : `${w.experience} yr${w.experience !== '1' ? 's' : ''}`}
                      </span>
                    )}
                  </div>

                  {w.bio && (
                    <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{w.bio}</p>
                  )}

                  <a
                    href={`https://wa.me/254726899113?text=${encodeURIComponent(`Hi, I'm interested in requesting the ${w.category} worker (ID: ${w.id}) from Domestic Connect. My name is ${user?.first_name || 'Employer'}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg py-2 text-sm font-semibold transition-colors"
                  >
                    <MessageCircle size={15} /> Request this Worker
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CTA — submit own staffing request */}
        <div className="mt-10 rounded-2xl bg-[#0B6B5E] text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-lg">Don't see what you need?</p>
            <p className="text-white/75 text-sm mt-0.5">Submit a staffing request and we'll find the right match for you.</p>
          </div>
          <button type="button"
            onClick={() => navigate('/employer-dashboard')}
            className="shrink-0 bg-white text-teal-700 rounded-full px-6 py-2.5 font-semibold text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors">
            Submit a Request <ChevronRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default WorkersMarketplace;
