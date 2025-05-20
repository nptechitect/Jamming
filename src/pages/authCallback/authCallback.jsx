// src/pages/authCallback/authCallback.jsx
import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '@/context/authContext/authContext';
import { MusicServices } from "@/config/musicServices";
import styles from './authCallback.module.css';

export default function AuthCallback() {
    const { selectedService, setTokens, setAuthStatus } = useContext(AuthContext);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get('code');
        let serviceId = searchParams.get('state');


        if (!serviceId){
            serviceId = selectedService
            if (!serviceId) {
                setError('Service ID missing from state');
                return;
            }
        }

        // Check if we have a code
        if (!code){
            setError('Authorization code not found in URL.');
            return;
        }

        const service = MusicServices.find((s) => s.id === serviceId);
        if (!service) {
            setError('Unknown music service.');
            return;
        }

        const verifier = localStorage.getItem(`pkce_${serviceId}`);
        if (!verifier) {
            setError('PKCE code verifier missing');
            return;
        }

        // Exchange code for tokens
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: service.redirectUri,
            client_id: service.clientId,
            code_verifier: verifier,
        });

        fetch(service.tokenUri, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Token request failed: ${res.statusText}`);
                return res.json();
            })
            .then((data) => {
                // Save tokens and mark service as authenticated
                setTokens((prev) => {
                    const updated = { ...prev, [serviceId]: data };
                    return updated;
                });
                setAuthStatus((prev) => ({ ...prev, [serviceId]: true}));
                // Redirect back to home/dashboard
                navigate('/');
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
            });
    }, [searchParams, selectedService, setTokens, setAuthStatus, navigate]);

    if (error) return <div className={styles.error}>Error: {error}</div>;
    return <div className={styles.loading}>Finalizing authentication...</div>;
}