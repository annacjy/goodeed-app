import Link from 'next/link';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

import styles from './styles.module.scss';
import Button from 'components/Button';

const SidebarNav = () => {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('token');
    router.replace('/');
  };

  return (
    <nav className={styles.nav}>
      <img src="/help.svg" alt="goodeed logo" width="70" />
      <ul>
        <li>
          <Link href="/home">
            <a>Home</a>
          </Link>
        </li>
        <li>
          <Link href="/dashboard">
            <a>Dashboard</a>
          </Link>
        </li>
        <li>
          <Link href="/chat">
            <a>Messages</a>
          </Link>
        </li>
        <Button name="Add your post" />
        <li onClick={handleLogout}>logout</li>
      </ul>
    </nav>
  );
};

export default SidebarNav;
