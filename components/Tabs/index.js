import styles from './styles.module.scss';

const Tabs = ({ tabs, active, onTabClick }) => {
  return (
    <div className={styles.tabs}>
      {tabs.map(tab => (
        <div
          key={tab}
          onClick={() => onTabClick(tab)}
          className={`${styles.tabs__tab} ${styles[`tabs__tab--${active === tab && 'active'}`]}`}
        >
          {tab}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
