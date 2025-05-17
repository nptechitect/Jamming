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

export function AuthProvider({ children }) {
    const [selectedService, setSelectedService] = useState(null);
    const [tokens, setTokens] = useState({});
    const [authStatus, setAuthStatus] = useState({});
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

        // build uri
        const params = new URLSearchParams({
            client_id: service.clientId,
            redirect_uri: service.redirect_uri,
            response_type: 'code',
            scope: service.scopes.join(' '),
        });

        window.location.href = `${service.authUri} ? ${params.toString()}`;
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