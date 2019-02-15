/**
 * 
 */
import Link from 'next/link'

/**
 * 
 */
import './menu.css'

/**
 * 
 */
const Menu = () => (
    <div className="menu">
        <Link href="/">
          <a className="menu__item">Главная</a>
        </Link>
        <Link href="/deploy">
          <a className="menu__item">Deploy</a>
        </Link>
    </div>
)

/**
 * 
 */
export default Menu