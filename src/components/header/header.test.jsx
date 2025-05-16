import { render, screen } from '@testing-library/react';
import Header from './header';
import { MemoryRouter } from 'react-router-dom';

describe('Header', () => {
    it('renders the header', () => {
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        )
        expect(screen.getByRole('banner')).toBeInTheDocument()
    })
})