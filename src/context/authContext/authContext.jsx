import React, { createContext, useState, useEffect } from 'react';
import { MusicServices } from '@/config/musicServices';

export const AuthContext = createContext ({
    services: [],
    selectedService: null,
    tokens: {},
    authStatus: {},
    loading: true,
    selectService: () => {},
    login: () => {},
    logout: () => {},
    setTokens: () => {},
    setAuthStatus: () => {},
    refreshToken: () => {},
});
const refreshTimeouts = {}; // map serviceId -> timout ID

// Helper: generate a secure random string for PKCE
function generateRandomString(length = 128) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => ('0' + (b % 256).toString(16)).slice(-2))
    .join('');
}

// Helper: base64-url-encode an ArrayBuffer
function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Helper: generate code challenge from verifier
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

export function AuthProvider({ children }) {
    const [selectedService, setSelectedService] = useState(
        () => localStorage.getItem('selectedService') || null
    );
    const [tokens, setTokens] = useState(
        () => localStorage.getItem('tokens') || {}
    );
    const [authStatus, setAuthStatus] = useState(
        () => localStorage.getItem('authStatus') || {}
    );
    const [loading, setLoading] = useState(true);

    // Load saved state when created
    useEffect(() => {
        const savedTokens = JSON.parse(localStorage.getItem('tokens')) || {};
        const savedAuthStatus = JSON.parse(localStorage.getItem('authStatus')) || {};
        const savedSelected = localStorage.getItem('selectedService');

        setTokens(savedTokens);
        setAuthStatus(savedAuthStatus);
        setSelectedService(savedSelected);
        setLoading(false);
    }, []);

    // Persist the tokens on change
    useEffect(() => {
        localStorage.setItem('tokens', JSON.stringify(tokens));
    }, [tokens]);

    // Persist the authStatus on change
    useEffect(() => {
        localStorage.setItem('authStatus', JSON.stringify(authStatus));
    }, [authStatus]);

    // Presist selectedService on change, remove if missing
    useEffect(() => {
        if (selectedService) {
            localStorage.setItem('selectedService', selectedService)
        } else {
            localStorage.removeItem('selectedService');
        }
    }, [selectedService]);

    // --- Refresh Logic ---
    // Helper: Refresh token automatically based on timer
    const scheduleRefresh = (serviceId, expiresInSeconds) => {
        // clear any existing timer
        if (refreshTimeouts[serviceId]) {
            clearTimeout(refreshTimeouts[serviceId])
        }

        // refresh a minute before actual expiry
        const refreshInMs = (expiresInSeconds - 60) * 1000;

        refreshTimeouts[serviceId] = setTimeout(() => {
            refreshToken(serviceId);
        }, refreshInMs);
    }

    // Rehydrate and schedule pending refreshes on mount
    useEffect(() => {
        Object.entries(tokens).forEach(([svcId, data]) => {
            if (data.expires_in) {
                scheduleRefresh(svcId, data.expires_in);
            }
        })
    });

    // Select a service
    const selectService = (serviceId) => {
        setSelectedService(serviceId);
    };

    // Initiate OAuth Login
    const login = (serviceId) => {
        const id = serviceId || selectedService;
        const service = MusicServices.find((s) => s.id === id);
        // Exit if no service found
        if (!service) return;

        // Create verifier and challenge
        const codeVerifier = generateRandomString();
        generateCodeChallenge(codeVerifier).then((codeChallenge) => {
            // persist the verifier
            localStorage.setItem(`pkce_${serviceId}`, codeVerifier);

            // build uri
            const params = new URLSearchParams({
                client_id: service.clientId,
                redirect_uri: service.redirectUri,
                response_type: 'code',
                scope: service.scopes.join(' '),
                code_challenge: codeChallenge,
                code_challenge_method: 'S256',
                state: serviceId,
            });

            window.location.href = `${service.authUri}?${params.toString()}`;
        });
    }

    // Initiate OAuth Logout
    const logout = (serviceId) => {
        const id = serviceId || selectedService;

        // remove existing token
        setTokens((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });

        // Remove existing authStatus
        setAuthStatus((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });

        if (selectedService === id) {
            setSelectedService(null);
        }
    }

    // refresh the token
    const refreshToken = async (serviceId) => {
        const service = MusicServices.find((s) => s.id === serviceId);
        const stored = tokens[serviceId];
        const refreshToken = stored?.refresh_token;
        if (!refreshToken) return logout(serviceId); // nothing to refresh

        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: service.clientId,
        }).toString();

        try {
            const res = await fetch(service.tokenUri, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${service.clientId}:${service.clientSecret}`)}`,
                    'Accept': 'application/json',
                },
                body: body,
            });

            if (!res.ok) throw new Error('Refresh failed');

            const data = await res.json()
            setTokens((prev) => {
                const updated = {
                    ...prev,
                    [serviceId]: { ...prev[serviceId], ...data },
                }
                scheduleRefresh(serviceId, data.expires_in)
                return updated
            })

            setAuthStatus((prev) => ({ ...prev, [serviceId]: true }))
        }catch (err) {
            console.error('Token refresh error:', err);
            logout(serviceId);
        }
    }

    const value = {
        services: MusicServices,
        selectedService,
        tokens,
        authStatus,
        loading,
        selectService,
        login,
        logout,
        setTokens,
        setAuthStatus,
        refreshToken
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    )
}