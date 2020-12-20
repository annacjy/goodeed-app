import SidebarNav from 'components/SidebarNav';

export default Page => {
  return () => (
    <div>
      <SidebarNav />
      <main>
        <Page />
      </main>
    </div>
  );
};
