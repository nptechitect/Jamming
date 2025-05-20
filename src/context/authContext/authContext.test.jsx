import React, { useContext } from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, AuthContext } from './authContext'
import { MusicServices } from '@/config/musicServices';

const initialToken = {
    tidal: {
        access_token: 'old-access',
        refresh_token: 'old-refresh',
        expires_in: 3000,
    }
}
const refreshedResponse = {
    access_token: 'new-access',
    refresh_token: 'new-refresh',
    expires_in: 7200,
}

// Helper consume component to access context
function TestConsumer() {
    const {
        services: svc,
        selectedService,
        tokens,
        authStatus,
        loading,
        selectService,
        login,
        logout,
        setTokens,
        setAuthStatus,
    } = useContext(AuthContext);

    // console.log("Services:", svc);

    return (
        <div>
            <div data-testid="selected">{selectedService}</div>
            <div data-testid="tokens">{JSON.stringify(tokens)}</div>
            <div data-testid="authStatus">{JSON.stringify(authStatus)}</div>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="services">{svc.map((s) => s.id).join(',')}</div>
            <button data-testid="select" onClick={() => selectService('tidal')} />
            <button data-testid="login" onClick={() => login('tidal')} />
            <button data-testid="logout" onClick={() => logout('tidal')} />
        </div>
    );
}

// Helper consumer to trigger refreshToken and display tokens
function RefreshConsumer() {
    const {tokens, refreshToken} = useContext(AuthContext);

    return (
        <div>
            <div data-testid="tokens">{JSON.stringify(tokens)}</div>
            <button data-testid="refresh" onClick={() => refreshToken('tidal')} />
        </div>
    )
}

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
        // stub window.location.href
        delete window.location;
        window.location = { href: '' };
    });

    it('initializes from localStorage', async () => {
        localStorage.setItem('tokens', JSON.stringify({ spotify: 'tok' }));
        localStorage.setItem('authStatus', JSON.stringify({ spotify: 'ok' }));
        localStorage.setItem('selectedService', 'spotify');

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
        });

        expect(screen.getByTestId('selected')).toHaveTextContent('spotify');
        expect(screen.getByTestId('tokens')).toHaveTextContent('{"spotify":"tok"}');
        expect(screen.getByTestId('authStatus')).toHaveTextContent('{"spotify":"ok"}');
        expect(screen.getByTestId('services')).toHaveTextContent(
            MusicServices.map(s => s.id).join(',')
        );
    });

    it('selectService updates context and localStorage', async () => {
        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        fireEvent.click(screen.getByTestId('select'));
        await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('tidal'));
        expect(localStorage.getItem('selectedService')).toBe('tidal');
    });

    it('login redirects to the correct URL', async () => {
        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        fireEvent.click(screen.getByTestId('login'));

        await waitFor(() => {
            const cfg = MusicServices.find((s) => s.id === 'tidal');
            expect(window.location.href).toContain(cfg.authUri);
            expect(window.location.href).toContain(cfg.clientId);
        })
    })

    it('logout clears selectedService, tokens, and authStatus', async () => {
        localStorage.setItem('tokens', JSON.stringify({ tidal: 'tok' }));
        localStorage.setItem('authStatus', JSON.stringify({ tidal: 'ok' }));
        localStorage.setItem('selectedService', 'tidal');

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

        fireEvent.click(screen.getByTestId('logout'));
        expect(screen.getByTestId('services')).toHaveTextContent('tidal');
        expect(screen.getByTestId('selected')).toHaveTextContent('');
        expect(screen.getByTestId('tokens')).toHaveTextContent('{}');
        expect(screen.getByTestId('authStatus')).toHaveTextContent('{}');
        expect(localStorage.getItem('selectedService')).toBeNull();
    });
});

describe('AuthContext - RefreshToken', () => {


    beforeEach(() => {
        vi.resetAllMocks()
        localStorage.clear()
        // Pre-Populate context state from localStorage
        localStorage.setItem('tokens', JSON.stringify(initialToken));

        // mock the fetch that refreshToken will call
        global.fetch = vi.fn(() => {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(refreshedResponse),
            })
        })
    })

    it('should POST a refresh_token grant and update tokens in context', async () => {
        render(
            <AuthProvider>
                <RefreshConsumer />
            </AuthProvider>
        )

        // before refresh: show the old tokens
        await waitFor(() => {
            expect(screen.getByTestId('tokens')).toHaveTextContent(
                JSON.stringify(initialToken)
            )
        })

        // trigger the refresh
        fireEvent.click(screen.getByTestId('refresh'))

        // wait for fetch to be called with the correct endpoint and body
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                MusicServices.find(s => s.id === 'tidal').tokenUri,
                expect.objectContaining({ method: 'POST' })
            )
        })

        // Finally the context tokens should reflect the refreshed values
        await waitFor(() => {
            expect(screen.getByTestId('tokens')).toHaveTextContent(
                JSON.stringify({ tidal: refreshedResponse })
            )
        })

        // Also ensure localStorage was updated
        const stored = JSON.parse(localStorage.getItem('tokens'))
        expect(stored).toEqual({ tidal: refreshedResponse })
    })
});