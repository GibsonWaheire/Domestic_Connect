import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const drawerRef = useRef<HTMLDivElement | null>(null);

    // Close avatar dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile drawer on Escape or outside click
    useEffect(() => {
        if (!isMenuOpen) return;
        const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMenuOpen(false); };
        const handleOutside = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) setIsMenuOpen(false);
        };
        window.addEventListener('keydown', handleEscape);
        window.addEventListener('mousedown', handleOutside);
        return () => {
            window.removeEventListener('keydown', handleEscape);
            window.removeEventListener('mousedown', handleOutside);
        };
    }, [isMenuOpen]);

    const getDashboardRoute = () => {
        if (!user) return '/';
        if (user.user_type === 'agency') return '/agency-dashboard';
        if (user.user_type === 'housegirl') return '/housegirl-dashboard';
        return '/employer-dashboard';
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const displayName = user?.first_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '';
    const photoUrl = (user as any)?.photo_url;

    const close = () => setIsMenuOpen(false);

    return (
        <>
            <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
                <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <Link to="/" className="flex flex-col leading-none">
                        <span className="text-xl font-bold tracking-tight text-[#111]">Domestic Connect</span>
                        <span className="text-[10px] text-teal-700 font-medium tracking-wide">Vetted Domestic Staff · Kenya</span>
                    </Link>

                    {/* Desktop nav links */}
                    <nav className="hidden md:flex items-center gap-1">
                        <Link to="/how-it-works" className="text-sm font-medium text-[#333] hover:text-black px-3 py-2 transition-colors">
                            How It Works
                        </Link>
                        <Link to="/why-choose-us" className="text-sm font-medium text-[#333] hover:text-black px-3 py-2 transition-colors">
                            About Us
                        </Link>
                        <Link to="/contact-us" className="text-sm font-medium text-[#333] hover:text-black px-3 py-2 transition-colors">
                            Contact
                        </Link>
                        <Link to="/for-housegirls" className="text-sm font-medium text-[#333] hover:text-black px-3 py-2 transition-colors">
                            Join as a Worker
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        {/* Desktop auth */}
                        {user ? (
                            <div className="hidden md:block relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 rounded-full focus:outline-none transition-all duration-200 hover:ring-2 hover:ring-gray-200 shadow-sm"
                                >
                                    {photoUrl ? (
                                        <img src={photoUrl} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-[#111] text-white flex items-center justify-center text-xs font-medium">
                                            {getInitials(displayName || user.email || 'U')}
                                        </div>
                                    )}
                                </button>

                                <div className={`absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 transition-all duration-200 origin-top-right ${dropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                        <p className="text-sm font-semibold text-[#111] truncate">{displayName || 'User'}</p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => { setDropdownOpen(false); navigate(getDashboardRoute()); }}
                                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                                    >
                                        Go to Dashboard <span className="ml-auto text-gray-400">→</span>
                                    </button>
                                    <div className="border-t border-gray-50 my-1"></div>
                                    <button
                                        onClick={() => { setDropdownOpen(false); signOut(); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 font-medium"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-3">
                                <Button onClick={() => navigate('/login')} variant="outline" className="rounded-full border-[#111] text-[#111] hover:bg-gray-50 h-[38px] px-5 transition-all duration-200 font-medium">
                                    Login
                                </Button>
                                <Button onClick={() => navigate('/login')} className="rounded-full bg-teal-700 hover:bg-teal-800 text-white h-[38px] px-5 transition-all duration-200 font-medium">
                                    Find a Worker
                                </Button>
                            </div>
                        )}

                        {/* Hamburger */}
                        <button
                            type="button"
                            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={isMenuOpen}
                            onClick={() => setIsMenuOpen(p => !p)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-black hover:bg-gray-100 transition-colors"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile / full-site drawer */}
            <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isMenuOpen ? 'bg-black/30 opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <aside
                    ref={drawerRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Navigation menu"
                    className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="h-full overflow-y-auto p-6">
                        <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-[16px] font-bold text-[#111]">Domestic Connect</p>
                                <p className="text-[11px] text-teal-700 font-medium">Vetted Domestic Staff · Kenya</p>
                            </div>
                            <button type="button" aria-label="Close menu" onClick={close} className="h-10 w-10 inline-flex items-center justify-center text-gray-500 text-xl">×</button>
                        </div>

                        {/* Logged-in user info */}
                        {user && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-3 flex items-center gap-3">
                                {photoUrl ? (
                                    <img src={photoUrl} alt="Profile" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-[#111] text-white flex items-center justify-center text-sm font-medium shrink-0">
                                        {getInitials(displayName || user.email || 'U')}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[#111] truncate">{displayName || 'User'}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-xl p-2 mb-3 flex flex-col">
                            <button type="button" onClick={() => { close(); navigate('/how-it-works'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>How It Works</span><span className="text-gray-300 text-sm">›</span></button>
                            <button type="button" onClick={() => { close(); navigate('/why-choose-us'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>About Us</span><span className="text-gray-300 text-sm">›</span></button>
                            <button type="button" onClick={() => { close(); navigate('/contact-us'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Contact Us</span><span className="text-gray-300 text-sm">›</span></button>
                            <button type="button" onClick={() => { close(); navigate('/for-housegirls'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Join as a Worker</span><span className="text-gray-300 text-sm">›</span></button>
                        </div>

                        <div className="pt-1 flex flex-col gap-2">
                            {user ? (
                                <>
                                    <Button onClick={() => { close(); navigate(getDashboardRoute()); }} className="w-full rounded-xl py-3 text-center font-medium bg-teal-700 text-white hover:bg-teal-800">Dashboard →</Button>
                                    <Button variant="outline" onClick={() => { close(); signOut(); }} className="w-full rounded-xl py-3 text-center font-medium border border-black text-black">Sign Out</Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={() => { close(); navigate('/login'); }} variant="outline" className="w-full rounded-xl py-3 text-center font-medium border border-black text-black">Login</Button>
                                    <Button onClick={() => { close(); navigate('/login'); }} className="w-full rounded-xl py-3 text-center font-medium bg-teal-700 text-white hover:bg-teal-800">Find a Worker →</Button>
                                </>
                            )}
                        </div>

                        {/* Drawer footer */}
                        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                            <p className="text-[13px] font-semibold text-[#111]">Domestic Connect</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Kenya's trusted vetted domestic staffing agency</p>
                            <div className="flex items-center justify-center gap-3 mt-3">
                                <button type="button" onClick={() => { close(); navigate('/why-choose-us'); }} className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors">About</button>
                                <span className="text-gray-200">·</span>
                                <button type="button" onClick={() => { close(); navigate('/contact-us'); }} className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors">Contact</button>
                                <span className="text-gray-200">·</span>
                                <button type="button" onClick={() => { close(); navigate('/how-it-works'); }} className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors">How It Works</button>
                            </div>
                            <p className="text-[10px] text-gray-300 mt-3">© {new Date().getFullYear()} Domestic Connect</p>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
};

export default Navbar;
