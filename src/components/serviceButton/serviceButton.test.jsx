import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ServiceButton from './serviceButton';

const mockService = {
    id: 'tidal',
    name: 'Tidal',
    logo: '',
}

describe('ServiceButton', () => {
    it('Renders a button with the service name', () => {
        render(
            <ServiceButton
                service={mockService}
                onSelect={vi.fn()}
                onConnect={vi.fn()}
            />
        );

        const button = screen.getByRole('button', {name: /tidal/i });

        expect(button).toBeInTheDocument();
    });

    it('calls onSelect and onConnnect with service id on click', () => {
        const onSelect = vi.fn();
        const onConnect = vi.fn();

        render(
            <ServiceButton
                service={mockService}
                onSelect={onSelect}
                onConnect={onConnect}
            />
        );

        const button = screen.getByRole('button', { name: /tidal/i });
        fireEvent.click(button);

        expect(onSelect).toHaveBeenCalledWith('tidal');
        expect(onConnect).toHaveBeenCalledWith('tidal');
    })
})