import Head from 'next/head';
import styles from '../styles/Home.module.css';

import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

export default function Home() {
  const GET_USERS = gql`
    query {
      users {
        id
        firstName
      }
    }
  `;

  const { loading, error, data } = useQuery(GET_USERS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {data.users.map(el => (
        <div key={el.id}>
          <h1>{el.id}</h1>
          <p>{el.firstName}</p>
        </div>
      ))}
      <div>HELLOOO</div>
    </div>
  );
}
