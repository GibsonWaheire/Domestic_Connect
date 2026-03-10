import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { Button } from '@/components/ui/button';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const displayName = user?.display_name || user?.first_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '';
    const photoUrl = (user as any)?.photo_url;

    return (
        <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
            <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                <Link to="/" className="flex flex-col leading-none">
                    <span className="text-xl font-bold tracking-tight text-[#111]">Domestic Connect</span>
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
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
                        <div className="flex items-center gap-3">
                            <Button onClick={() => navigate('/login')} variant="outline" className="rounded-full border-[#111] text-[#111] hover:bg-gray-50 h-[38px] px-5 transition-all duration-200 font-medium">
                                Login
                            </Button>
                            <Button onClick={() => navigate('/login?mode=signup')} className="rounded-full bg-[#111] hover:bg-[#333] text-white h-[38px] px-5 transition-all duration-200 font-medium">
                                Join Today
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
