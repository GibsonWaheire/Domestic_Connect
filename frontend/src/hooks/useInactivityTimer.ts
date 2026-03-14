import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { User, INACTIVITY_TIMEOUT } from '@/lib/authUtils';

export const useInactivityTimer = (
    user: User | null,
    signOut: (redirectTo?: string) => Promise<void>
) => {
    useEffect(() => {
        if (!user) {
            return;
        }

        let timer: ReturnType<typeof setTimeout>;
        let warningTimer: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            clearTimeout(timer);
            clearTimeout(warningTimer);

            warningTimer = setTimeout(() => {
                toast({
                    title: "Session Expiring",
                    description: "You will be logged out in 30 seconds due to inactivity.",
                    variant: "destructive",
                });
            }, INACTIVITY_TIMEOUT - 30 * 1000); // warn 30s before logout

            timer = setTimeout(async () => {
                toast({
                    title: "Session Expired",
                    description: "You have been logged out due to inactivity.",
                    variant: "destructive",
                });
                await signOut('/login');
            }, INACTIVITY_TIMEOUT);
        };

        const events: Array<keyof WindowEventMap> = [
            'mousedown',
            'mousemove',
            'keydown',
            'touchstart',
            'click',
            'scroll',
        ];

        events.forEach((eventName) => window.addEventListener(eventName, resetTimer));
        resetTimer();

        return () => {
            clearTimeout(timer);
            clearTimeout(warningTimer);
            events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
        };
    }, [user, signOut]);
};
