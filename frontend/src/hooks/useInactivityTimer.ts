import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { User, INACTIVITY_TIMEOUT } from '@/lib/authUtils';

export const useInactivityTimer = (
    user: User | null,
    signOut: (redirectTo?: string) => Promise<void>
) => {
    // Keep signOut in a ref so it never causes the effect to re-run.
    // Without this, every new signOut reference (caused by isFirebaseUser
    // changing in useAuthEnhanced) would restart the 2-minute countdown.
    const signOutRef = useRef(signOut);
    useEffect(() => { signOutRef.current = signOut; }, [signOut]);

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
            }, INACTIVITY_TIMEOUT - 30 * 1000);

            timer = setTimeout(async () => {
                toast({
                    title: "Session Expired",
                    description: "You have been logged out due to inactivity.",
                    variant: "destructive",
                });
                await signOutRef.current('/login');
            }, INACTIVITY_TIMEOUT);
        };

        // mousemove excluded intentionally — it fires on every cursor pixel
        // and would reset the timer constantly, preventing logout.
        const events: Array<keyof WindowEventMap> = [
            'mousedown',
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
    }, [user]); // signOut intentionally omitted — accessed via ref above
};
