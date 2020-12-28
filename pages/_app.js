import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import UserContext from 'components/UserContext';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

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

  useEffect(() => {
    const token = Cookies.get('token');

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
        setUserContext(error ? { user: null } : { user: decoded });
      });
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
