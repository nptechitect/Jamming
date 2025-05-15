import { render, screen } from '@testing-library/react';
import TestButton from './components/TestButton';

describe('Button Component', () => {
    it('renders the label', () => {
        render(<TestButton label="Click me"/>)
        expect(screen.getByRole('button')).toHaveTextContent('Click me')
    })
})