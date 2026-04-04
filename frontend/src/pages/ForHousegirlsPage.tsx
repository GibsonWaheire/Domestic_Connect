import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Briefcase, CheckCircle, MapPin, Menu, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { API_BASE_URL } from '@/lib/apiConfig';

const ForHousegirlsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.user_type === 'housegirl') return '/housegirl-dashboard';
    if (user.user_type === 'agency') return '/agency-dashboard';
    return '/employer-dashboard';
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMenuOpen(false); };
    const handleOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('mousedown', handleOutside);
    return () => { window.removeEventListener('keydown', handleEscape); window.removeEventListener('mousedown', handleOutside); };
  }, [isMenuOpen]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/jobs/?per_page=6`);
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
        }
      } catch {
        // silently fail — jobs section just won't show
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const accommodationLabel: Record<string, string> = {
    live_in: 'Live-in',
    live_out: 'Live-out',
    both: 'Live-in / Live-out',
  };

  return (
    <div className="min-h-screen bg-[#FDF6F0] text-[#111] font-sans">
      <Helmet>
        <title>Find House Help Jobs in Kenya | Domestic Connect</title>
        <meta name="description" content="Looking for a housegirl, nanny or caregiver job in Kenya? Browse verified job listings from families for free. Register free — pay KSh 100 only when you apply." />
        <meta name="keywords" content="housegirl jobs kenya, nanny jobs nairobi, caregiver jobs kenya, domestic worker jobs mombasa, house help jobs kenya, find domestic work kenya" />
        <link rel="canonical" href="https://domestic-connect.co.ke/for-housegirls" />
        <meta property="og:title" content="Find House Help Jobs in Kenya | Domestic Connect" />
        <meta property="og:description" content="Browse free job listings from verified families across Kenya. Register free — pay KSh 100 only when you apply for a job." />
        <meta property="og:url" content="https://domestic-connect.co.ke/for-housegirls" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Find House Help Jobs in Kenya | Domestic Connect" />
        <meta name="twitter:description" content="Browse free job listings from verified families across Kenya. Register free — pay KSh 100 only when you apply." />
      </Helmet>

      {/* NAVBAR */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-40">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-[#111]">Domestic Connect</Link>

          <nav className="hidden md:flex items-center gap-3">
            <Link to="/housegirls" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-1.5">
              Browse Workers
            </Link>
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-1.5">
              For Employers
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate(getDashboardRoute())} className="rounded-full bg-[#111] hover:bg-[#333] text-white h-[38px] px-5">
                Dashboard →
              </Button>
            ) : (
              <>
                <Button onClick={() => navigate('/login')} variant="outline" className="rounded-full border-[#111] text-[#111] hover:bg-gray-50 h-[38px] px-5">
                  Login
                </Button>
                <Button onClick={() => navigate('/login?mode=signup&userType=housegirl')} className="rounded-full bg-[#111] hover:bg-[#333] text-white h-[38px] px-5">
                  Register Free
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMenuOpen(p => !p)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-black hover:bg-gray-100 transition-colors md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isMenuOpen ? 'bg-black/30 opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <aside
          ref={drawerRef}
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="h-full overflow-y-auto p-6">
            <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
              <p className="text-[16px] font-bold text-[#111]">Domestic Connect</p>
              <button type="button" onClick={() => setIsMenuOpen(false)} className="h-10 w-10 inline-flex items-center justify-center text-gray-500">×</button>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              {user ? (
                <Button onClick={() => { setIsMenuOpen(false); navigate(getDashboardRoute()); }} className="w-full rounded-xl bg-black text-white">
                  Dashboard →
                </Button>
              ) : (
                <>
                  <Button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} variant="outline" className="w-full rounded-xl border-black text-black">
                    Login
                  </Button>
                  <Button onClick={() => { setIsMenuOpen(false); navigate('/login?mode=signup&userType=housegirl'); }} className="w-full rounded-xl bg-black text-white">
                    Register Free
                  </Button>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* HERO */}
      <section className="bg-[#111] text-white py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 text-center">
          <span className="inline-block bg-white/10 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase">
            For House Help in Kenya
          </span>
          <h1 className="text-[36px] md:text-[52px] font-extrabold tracking-tight leading-[1.1] mb-5 max-w-3xl mx-auto">
            Find your next household job — fast
          </h1>
          <p className="text-white/70 text-[16px] mb-8 max-w-xl mx-auto leading-relaxed">
            Hundreds of verified families in Nairobi, Mombasa, Kisumu and across Kenya are actively looking for housegirls, nannies, cooks and caregivers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/login?mode=signup&userType=housegirl')}
              className="rounded-full bg-white text-[#111] hover:bg-gray-100 h-12 px-8 text-[15px] font-semibold"
            >
              Register Free — Start Today
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="rounded-full border-white/40 text-white hover:bg-white/10 h-12 px-8 text-[15px]"
            >
              Already registered? Login
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-[13px] text-white/60 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400" /> Free to register</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400" /> KSh 100 per application</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400" /> No agency commission</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400" /> Direct contact with employer</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 tracking-tight">How it works for you</h2>
          <p className="text-center text-[#666] text-sm max-w-md mx-auto mb-10">Three simple steps to land your next job</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Register Free',
                desc: 'Create your free account in minutes. No upfront fee. No agency commission deducted from your salary.',
                icon: '👤',
              },
              {
                step: '2',
                title: 'Browse Jobs Free',
                desc: 'View all live job listings from verified employers across Kenya — completely free, no payment needed to browse.',
                icon: '🔍',
              },
              {
                step: '3',
                title: 'Pay KSh 100 to Apply',
                desc: 'Found the right job? Pay a small KSh 100 application fee, attach a cover letter, and get hired directly.',
                icon: '🤝',
              },
            ].map((item) => (
              <div key={item.step} className="bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#111] text-white flex items-center justify-center text-2xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Step {item.step}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE JOB LISTINGS */}
      <section className="bg-[#fafafa] py-16 md:py-20">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Latest job openings</h2>
              <p className="text-[#666] text-sm mt-1">Posted by verified families — updated daily</p>
            </div>
            <Button onClick={() => navigate('/login?mode=signup&userType=housegirl')} className="rounded-full bg-[#111] text-white hover:bg-[#333] hidden sm:flex">
              View All Jobs →
            </Button>
          </div>

          {loadingJobs ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No job listings yet — check back soon.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-base font-bold text-[#111] leading-tight">{job.title}</h3>
                    <span className="shrink-0 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full border border-green-200">
                      Active
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> {job.location}
                      </span>
                    )}
                    {(job.salary_min || job.salary_max) && (
                      <span className="flex items-center gap-1">
                        💰 KSh {(job.salary_min || 0).toLocaleString()}
                        {job.salary_max ? ` – ${job.salary_max.toLocaleString()}` : '+'}
                        /mo
                      </span>
                    )}
                    {job.accommodation_type && (
                      <span className="flex items-center gap-1">
                        🏠 {accommodationLabel[job.accommodation_type] || job.accommodation_type}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {job.applications_count || 0} applicant{job.applications_count !== 1 ? 's' : ''}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => navigate('/login?mode=signup&userType=housegirl')}
                      className="rounded-full bg-[#111] text-white hover:bg-[#333] text-xs px-4"
                    >
                      Apply Now →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <div className="inline-block bg-[#111] text-white rounded-xl px-6 py-4">
              <p className="font-semibold mb-1">Want to see full job details + apply?</p>
              <p className="text-sm text-white/70 mb-3">Register free, browse all jobs, and pay KSh 100 only when you apply.</p>
              <Button
                onClick={() => navigate('/login?mode=signup&userType=housegirl')}
                className="rounded-full bg-white text-[#111] hover:bg-gray-100 font-semibold px-6"
              >
                Register Free & Browse Jobs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* WHY JOIN */}
      <section className="bg-white py-16 md:py-20 border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 tracking-tight">Why use Domestic Connect?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { icon: '🆓', title: 'Free to Register & Browse', desc: 'Create your profile and browse all job listings at no cost. Only pay KSh 100 when you apply.' },
              { icon: '💼', title: 'Real Jobs, Real Families', desc: 'All listings are posted by verified employers actively looking for house help.' },
              { icon: '📱', title: 'Direct Contact', desc: 'No agency in between. Employers contact you directly — keep 100% of your salary.' },
              { icon: '🌍', title: 'All Major Cities', desc: 'Jobs in Nairobi, Mombasa, Kisumu, Nakuru and over 15 cities across Kenya.' },
              { icon: '🔒', title: 'Secure & Private', desc: 'Your personal details are only shared with employers you accept.' },
              { icon: '⚡', title: 'Get Hired Fast', desc: 'Employers can see your profile the moment you register. No waiting.' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-[#111] mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#fafafa] py-16 border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold text-center mb-8 tracking-tight">What house help say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { text: '"I got a job in just 3 days. Such a wonderful family. Thank you Domestic Connect!"', name: 'Amina W.', loc: 'Mombasa', stars: 5 },
              { text: '"Free to register and the jobs are real. I got hired in Nairobi within a week."', name: 'Grace K.', loc: 'Nairobi', stars: 5 },
              { text: '"No salary deductions at all. The employer called me directly after seeing my profile."', name: 'Fatuma A.', loc: 'Kisumu', stars: 5 },
            ].map((t) => (
              <div key={t.name} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="italic text-[#444] text-sm mb-4 leading-relaxed">"{t.text}"</p>
                <p className="text-xs font-bold text-[#111]">— {t.name} · {t.loc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-[#111] text-white py-14">
        <div className="max-w-[700px] mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">Ready to find your next job?</h2>
          <p className="text-white/70 mb-6 text-sm">Register free today. Browse all jobs for free. Pay KSh 100 only when you apply for a job.</p>
          <Button
            onClick={() => navigate('/login?mode=signup&userType=housegirl')}
            className="rounded-full bg-white text-[#111] hover:bg-gray-100 h-12 px-10 text-base font-semibold"
          >
            Register Free Now →
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#111] text-white border-t border-white/10 py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <p>© {new Date().getFullYear()} Domestic Connect Kenya</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/contact-us" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>

      {/* WhatsApp */}
      <div className="fixed bottom-5 left-5 z-50 group flex items-center">
        <span className="mr-2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-sm font-medium text-[#111] shadow-md opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
          Chat with us
        </span>
        <a
          href="https://wa.me/254726899113"
          target="_blank"
          rel="noopener noreferrer"
          className="h-14 w-14 rounded-full bg-green-500 text-white shadow-xl inline-flex items-center justify-center hover:bg-green-600 transition-colors"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={24} />
        </a>
      </div>
    </div>
  );
};

export default ForHousegirlsPage;
