import SidebarNav from 'components/SidebarNav';
import styles from './styles.module.scss';
import Head from 'next/head';

export default Page => {
  return () => (
    <div className={styles.layout}>
      <Head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`}
        ></script>
      </Head>
      <SidebarNav />
      <main className={styles.layout__main}>
        <Page />
      </main>
    </div>
  );
};
