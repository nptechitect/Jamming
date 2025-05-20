// src/pages/authCallback/authCallback.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthCallback from './authCallback';
import { AuthContext } from '@/context/authContext/authContext';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
let mockSearchParams;
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams]
}));

describe('AuthCallback', () => {
    const setTokens = vi.fn();
    const setAuthStatus = vi.fn();
    const selectedService = 'tidal';
    const tokenResponse = { access_token: 'abc', refresh_token: 'def' };

    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.clear();

        // Provide code and store pkce verifier
        mockSearchParams = new URLSearchParams({ code: 'testcode' });
        localStorage.setItem('pkce_tidal', 'verifier123');
        // Mock fetch
        global.fetch = vi.fn(() =>
            Promise.resolve( {
                ok: true,
                json: () => Promise.resolve(tokenResponse),
            })
        );
    });

    it('exchanges code for token and updates context then navigates home', async () => {
        render(
            <AuthContext.Provider value={{ selectedService, setTokens, setAuthStatus }}>
                <AuthCallback />
            </AuthContext.Provider>
        );

        // Should show loading state initially
        expect(screen.getByText(/Finalizing authentication/i)).toBeInTheDocument();

        // wait for fetch and context updates
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        // setTokens should be called with a function updater
        expect(setTokens).toHaveBeenCalled();
        const tokenUpdater = setTokens.mock.calls[0][0];
        expect(typeof tokenUpdater).toBe('function');
        // Simulate previous tokens empty
        expect(tokenUpdater({})).toEqual({ tidal: tokenResponse });

        // setAuthStatus should also be called with a function updater
        expect(setAuthStatus).toHaveBeenCalled();
        const statusUpdater = setAuthStatus.mock.calls[0][0];
        expect(typeof statusUpdater).toBe('function');
        // simulate previous authStatus empty
        expect(statusUpdater({})).toEqual({ tidal: true });

        // Should navigate to home/dashboard
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('displays error if code param is missing', async () => {
        // No code in params
        mockSearchParams = new URLSearchParams({});

        render(
            <AuthContext.Provider value={{ selectedService, setTokens, setAuthStatus }}>
                <AuthCallback />
            </AuthContext.Provider>
        );

        // Error message should appear
        await waitFor(() => {
            expect(screen.getByText(/Authorization code not found/i)).toBeInTheDocument();
        });
        // Ensure no fetch
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('displays error if PKCE verifier not found', async () => {
        // Remove pkce verifier
        localStorage.removeItem('pkce_tidal');

        render(
            <AuthContext.Provider value={{ selectedService, setTokens, setAuthStatus }}>
                <AuthCallback />
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/PKCE code verifier missing/i)).toBeInTheDocument();
        });
        expect(global.fetch).not.toHaveBeenCalled();
    })
})
