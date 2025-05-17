import React, { useContext } from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, AuthContext } from './authContext'
import { MusicServices } from '@/config/musicServices';

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

    it('login redirects to the correct URL', () => {
        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        fireEvent.click(screen.getByTestId('login'));
        expect(window.location.href).toContain(MusicServices.find(s => s.id === 'tidal').authUri);
        expect(window.location.href).toContain(MusicServices.find(s => s.id === 'tidal').clientId);
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
})