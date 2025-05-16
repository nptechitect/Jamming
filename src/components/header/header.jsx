import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";

import NavMenu from "../navMenu/navMenu";
import { NavMenuLinks } from '@/context/navMenuLinks'

import styles from './header.module.css'

// Image resource imports
import logo from '@/assets/images/logo.svg'

export default function Header() {
    return (
        <header className={styles.header} role="banner">
            <NavLink to='/' className={styles.homeLink}>
                <img src={logo} alt="Jamming" className={styles.logo} />
                <h1 className={styles.siteName}>Jamming</h1>
            </NavLink>
            <NavMenu menuLinks={NavMenuLinks}/>
        </header>
    )
}