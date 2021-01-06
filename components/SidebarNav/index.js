import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Cookies from 'js-cookie';

import Logo from 'components/Logo';
import styles from './styles.module.scss';

const SidebarNav = () => {
  const router = useRouter();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const handleLogout = () => {
    Cookies.remove('token');
    router.replace('/');
  };

  const links = [
    { key: 'home', name: 'Home' },
    { key: 'dashboard', name: 'Dashboard' },
    { key: 'chat', name: 'Messages' },
  ];

  const active = links.find(link => `/${link.key}` === router.pathname);

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.nav__logo}>
          <Logo />
        </div>
        <ul>
          {links.map(link => (
            <li
              key={link.key}
              className={`${styles.nav__link} ${
                styles[`nav__link--${router.pathname === `/${link.key}` && 'active'}`]
              }`}
            >
              <Link href={`/${link.key}`}>
                <a>
                  <img
                    src={`/${router.pathname === `/${link.key}` ? `${link.key}--active` : link.key}.svg`}
                    alt={link.key}
                    className={styles.nav__linkIcon}
                  />
                  <span className={styles.nav__linkName}>{link.name}</span>
                </a>
              </Link>
            </li>
          ))}
          <li className={styles.nav__link} onClick={handleLogout}>
            <img src="/logout.svg" alt="logout" className={styles.nav__linkIcon} />
            <span className={styles.nav__linkName}>Logout</span>
          </li>
        </ul>
      </nav>

      <nav className={styles.navMobile}>
        <div className={styles.navMobile__logo} onClick={() => setIsSidebarVisible(!isSidebarVisible)}>
          <Logo />
          <h1>{active.name}</h1>
        </div>
        {isSidebarVisible && (
          <div className={styles.navMobile__lists}>
            {links.map(link => (
              <li
                key={link.key}
                className={`${styles.navMobile__link} ${
                  styles[`navMobile__link--${router.pathname === `/${link.key}` && 'active'}`]
                }`}
              >
                <img
                  src={`/${router.pathname === `/${link.key}` ? `${link.key}--active` : link.key}.svg`}
                  alt={link.key}
                  className={styles.navMobile__linkIcon}
                />
                <Link href={`/${link.key}`}>
                  <a className={styles.navMobile__linkName}>{link.name}</a>
                </Link>
              </li>
            ))}
            <li className={styles.navMobile__link} onClick={handleLogout}>
              <img src="/logout.svg" alt="logout" className={styles.navMobile__linkIcon} />
              <span className={styles.navMobile__linkName}>Logout</span>
            </li>
          </div>
        )}
      </nav>
    </>
  );
};

export default SidebarNav;
