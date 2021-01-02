import './app.scss';
import { useEffect, useState } from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import UserContext from 'components/UserContext';
import Cookies from 'js-cookie';

const httpLink = createHttpLink({
  uri: `${process.env.APP_URL}/api/graphql`,
});

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = Cookies.get('token');

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

function MyApp({ Component, pageProps }) {
  const [userContext, setUserContext] = useState({});

  const GET_USER_QUERY = gql`
    query user($token: String!) {
      user(token: $token) {
        username
        displayName
        userImage
        location {
          lat
          lng
          address
        }
      }
    }
  `;

  useEffect(async () => {
    const token = Cookies.get('token');

    if (token) {
      const response = await client.query({
        query: GET_USER_QUERY,
        variables: { token },
      });

      setUserContext({ user: response.data.user });
    }
  }, []);

  return (
    <ApolloProvider client={client}>
      <UserContext.Provider value={userContext}>
        <Component {...pageProps} />
      </UserContext.Provider>
    </ApolloProvider>
  );
}

export default MyApp;
