import Link from 'next/link';

const SidebarNav = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/home">
            <a>Home</a>
          </Link>
        </li>
        <li>
          <Link href="/profile">
            <a>Profile</a>
          </Link>
        </li>
        <li>
          <Link href="/chat">
            <a>Messages</a>
          </Link>
        </li>
        <li>logout</li>
      </ul>
    </nav>
  );
};

export default SidebarNav;
