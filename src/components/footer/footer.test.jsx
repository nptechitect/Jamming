import { render, screen } from '@testing-library/react';
import Footer from './footer';
import { MemoryRouter } from 'react-router-dom';

describe('Footer', () => {
    it('renders the footer', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        )
        expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('renders the provided links', () => {
        const menuLinks = [
            {
                href: "#",
                text: "Testing"
            },
            {
                href: "#",
                text: "Testing2"
            }
        ]

        render (
            <MemoryRouter>
                <Footer menuLinks={menuLinks} />
            </MemoryRouter>
        )

        const Link1 = screen.getByTestId("siteMap_Testing")
    })
})