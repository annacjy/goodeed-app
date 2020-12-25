import SidebarNav from 'components/SidebarNav';
import styles from './styles.module.scss';

export default Page => {
  return () => (
    <div className={styles.layout}>
      <SidebarNav />
      <main>
        <Page />
      </main>
    </div>
  );
};
