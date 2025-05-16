import { Outlet } from 'react-router-dom'
import Header from '../header/header'
import Footer from '../footer/footer'
import './layout.module.css'

export default function Layout() {
    return (
        <div className="pageWrapper">
            {/* Header Component */}
            <Header />

            <main>
                {/* Renders the matched page component */}
                <Outlet />
            </main>

            {/* Footer Component */}
            <Footer />
        </div>
    )
}