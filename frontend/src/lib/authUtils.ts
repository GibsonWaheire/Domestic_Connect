import { FirebaseAuthService } from './firebaseAuth';

export interface User {
    id: string;
    email: string | null;
    user_type: 'employer' | 'housegirl' | 'agency' | 'admin';
    first_name: string;
    last_name: string;
    phone_number?: string;
    created_at: string;
    updated_at: string;
    is_admin?: boolean;
    age?: number;
    location?: string;
    experience?: string;
    education?: string;
    expectedSalary?: string;
    accommodationType?: string;
    community?: string;
    skills?: string[];
    languages?: string[];
    bio?: string;
    firebase_uid?: string;
    is_firebase_user?: boolean;
    profile_photo_url?: string;
    photo_url?: string;
}

import { API_BASE_URL } from './apiConfig';
export const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const { headers, ...restOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...restOptions,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            signal: controller.signal,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API request failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection.');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

export const formatKenyanPhone = (phone: string) => FirebaseAuthService.formatKenyanPhone(phone);
