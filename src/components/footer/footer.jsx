import React from "react"

import { NavMenuLinks } from '@/context/navMenuLinks'

import styles from './footer.module.css'


export default function Footer({menuLinks}) {
    if(menuLinks === undefined || menuLinks.length === 0){
        menuLinks = NavMenuLinks
    }

    const siteMap = menuLinks.map((item) => {
        return (
            <li data-testid={"siteMap_" + item.text} key={"siteMap_" + item.text}>
                <a href={item.href}>{item.text}</a>
            </li>
        )
    })

    return (
        <footer className={styles.footer}>
            <div className={styles.copyright}>
                <h3>&copy;2025 Nick Parrish</h3>
            </div>
            <div className={styles.siteMap}>
                <ul>
                    {siteMap}
                </ul>
            </div>
        </footer>
    )
}