import React from 'react'
import styles from './navMenu.module.css'
import MenuIcon from '@/assets/images/menu-icon.svg'

export default function NavMenu({menuLinks}) {

    if (menuLinks === undefined || menuLinks.length === 0){
        menuLinks = [
            {
                href: "/",
                text: "Home"
            }
        ]
    }
    console.log("Links:", menuLinks)

    // Create menu list
    const hMenuItems = menuLinks.map((item) => {
        return (
            <li data-testid={"hMenuItem_" + item.text} key={"hMenuItem_" + item.text}>
                <a  href={item.href}>{item.text}</a>
            </li>
        )
    });

    const vMenuItems = menuLinks.map((item) => {
        return (
            <li data-testid={"vMenuItem_" + item.text} key={"vMenuItem_" + item.text}>
                <a  href={item.href}>{item.text}</a>
            </li>
        )
    })

    const toggleMenu = (e) => {
        const menuBox = icon.nextElementSibling

        // toggle the display
        if (menuBox.style.display === null || menuBox.style.display === 'block'){
            menuBox.style.display = 'none'
        }else{
            menuBox.style.display = 'block'
        }
    }

    return (
        <nav className={styles.menu}>
            <div className={styles.horzMenu}>
                <ul>
                    {hMenuItems}
                </ul>
            </div>
            <div className={styles.dropdownMenu} >
                <img src={MenuIcon} className={styles.menuIcon} alt='menuIcon' onClick={toggleMenu}/>
                <div id='' className={styles.dropdownContent} >
                    <ul>
                        {vMenuItems}
                    </ul>
                </div>
            </div>
        </nav>
    )
}