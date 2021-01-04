import Link from 'next/link';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

import Logo from 'components/Logo';
import styles from './styles.module.scss';

const SidebarNav = () => {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('token');
    router.replace('/');
  };

  const links = [
    { key: 'home', name: 'Home' },
    { key: 'dashboard', name: 'Dashboard' },
    { key: 'chat', name: 'Messages' },
  ];

  return (
    <nav className={styles.nav}>
      <Logo />
      <ul>
        {links.map(link => (
          <li
            key={link.key}
            className={`${styles.nav__link} ${styles[`nav__link--${router.pathname === `/${link.key}` && 'active'}`]}`}
          >
            <Link href={`/${link.key}`}>
              <a>{link.name}</a>
            </Link>
          </li>
        ))}
        <li onClick={handleLogout}>Logout</li>
      </ul>
    </nav>
  );
};

export default SidebarNav;
