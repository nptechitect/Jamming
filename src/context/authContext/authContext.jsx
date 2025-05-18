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
});

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
            // console.log("Saving selectedService", selectedService);
            localStorage.setItem('selectedService', selectedService)
        } else {
            // console.log("Removing selectedService", selectedService);
            localStorage.removeItem('selectedService');
        }
    }, [selectedService]);

    // Select a service
    const selectService = (serviceId) => {
        setSelectedService(serviceId);
        // persist immediately so callback can read it after redirect
        // localStorage.setItem('selectedService', serviceId);
    };

    // Initiate OAuth Login
    const login = (serviceId) => {
        const id = serviceId || selectedService;
        const service = MusicServices.find((s) => s.id === id);
        // Exit if no service found
        if (!service) return;

        // // use pkce-challenge library to generate verifier & challenge
        // const { code_verifier, code_challenge } = pkceChallenge();
        // console.log("verifier", code_verifier);
        // console.log("challenge", code_challenge);
        // console.log("Saving verifier");
        // localStorage.setItem(`pkce_${id}`, code_verifier);
        // console.log("Verifier saved");

        // Create verifier and challenge
        const codeVerifier = generateRandomString();
        generateCodeChallenge(codeVerifier).then((codeChallenge) => {
            // persist the verifier
            localStorage.setItem(`pkce_${serviceId}`, codeVerifier);

            // const stateObj = { serviceId, code_verifier };
            // const encodedState = btoa(JSON.stringify(stateObj));

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

            // alert("Ready to continue");
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
        setAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    )
}