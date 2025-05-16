import { render, screen } from '@testing-library/react';
import NavMenu from './navMenu';
import { MemoryRouter } from 'react-router-dom';

describe('NavMenu', () => {
    it('renders the NavMenu', () => {
        render(
            <MemoryRouter>
                <NavMenu />
            </MemoryRouter>
        )
        expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('renders the supplied links', () => {
        const navItems = [
            {
                href: "#",
                text: "Testing"
            },
            {
                href: "#",
                text: "Testing2"
            }
        ]
        render(
            <MemoryRouter>
                <NavMenu menuLinks={navItems} />
            </MemoryRouter>
        )
        const TestLink1 = screen.getByTestId('vMenuItem_Testing')
        const TestLink2 = screen.getByTestId('vMenuItem_Testing2')

        expect(TestLink1).toBeValid()
        expect(TestLink2).toBeValid()
    })
})