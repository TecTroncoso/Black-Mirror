import { User } from '../types';

export const loginUser = async (email: string, password: string): Promise<User> => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Login failed');
    }

    const user: User = data;
    localStorage.setItem('bm_user', JSON.stringify(user));
    return user;
};

export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
    }

    const user: User = data;
    localStorage.setItem('bm_user', JSON.stringify(user));
    return user;
};

export const logoutUser = async (): Promise<void> => {
    localStorage.removeItem('bm_user');
};

export const getStoredUser = (): User | null => {
    const stored = localStorage.getItem('bm_user');
    if (stored) {
        try {
            return JSON.parse(stored) as User;
        } catch (e) {
            return null;
        }
    }
    return null;
};
