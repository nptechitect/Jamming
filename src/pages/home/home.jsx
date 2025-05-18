// src/pages/home/home.jsx
import React, { useContext } from 'react';
import { AuthContext } from '@/context/authContext/authContext';
import ServiceButton from '@/components/serviceButton/serviceButton';
import styles from './Home.module.css'

export default function Home() {
    const {
        services,
        selectedService,
        authStatus,
        loading,
        selectService,
        login
    } = useContext(AuthContext);

    const handleServiceSelection = (serviceId) => {
        console.log('Selected Service ' + services.find((s) => s.id === serviceId).name);
        selectService(serviceId);
    }

    const handleServiceConnection = (serviceId) => {
        console.log('Connecting to ' + services.find((s) => s.id === serviceId).name);
        login(serviceId);
    }

    if (loading) {
        return <div className={styles.loading}>Loading...</div>
    }

    const isConnected = selectedService && authStatus[selectedService];

    return (
        <div className={styles.container}>
            {!isConnected ? (
                <div className={styles.serviceList}>
                    <h2>Connect to a Service</h2>
                    <ul>
                        {services.map((service) => (
                            <li key={service.id} className={styles.serviceItem}>
                                <ServiceButton
                                    service={service}
                                    onSelect={handleServiceSelection}
                                    onConnect={handleServiceConnection}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            ):(
                <div className={styles.connected}>
                    <h2>Connected to {services.find((s) => s.id === selectedService).name}</h2>
                </div>
            )}
        </div>
    );
}