import styles from './login.module.scss';
import Head from 'next/head';
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/react-hooks';
import UserContext from 'components/UserContext';
import gql from 'graphql-tag';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

import Input from 'components/Input';
import Button from 'components/Button';
import Logo from 'components/Logo';
import ErrorMessage from 'components/ErrorMessage';

const Login = () => {
  const router = useRouter();
  const [user, setUser] = useContext(UserContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const LOGIN_USER = gql`
    mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        token
        user {
          username
          displayName
          userImage
          location {
            lat
            lng
            address
          }
        }
        status {
          ok
          message
        }
      }
    }
  `;

  const REGISTER_USER = gql`
    mutation Register($username: String!, $password: String!) {
      register(username: $username, password: $password) {
        status {
          ok
          message
        }
      }
    }
  `;

  const [login, { loading: isLoginLoading }] = useMutation(LOGIN_USER, {
    onCompleted: data => {
      const { status, token, user } = data.login;

      if (status.ok) {
        Cookies.set('token', token, { expires: 1 });

        setUser(user);
        router.replace('/home');
      } else {
        setValidationMessage(status.message);
      }
    },
  });

  const [register, { loading: isRegisterLoading }] = useMutation(REGISTER_USER, {
    onCompleted: data => {
      const { status } = data.register;

      if (status.ok) {
        login({ variables: { username, password } });
      } else {
        setValidationMessage(status.message);
      }
    },
  });

  useEffect(async () => {
    const token = Cookies.get('token');
    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
      if (error) return;

      router.replace('/home');
    });
  }, []);

  return (
    <div className={styles.login}>
      <Head>
        <title>Login</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className={styles.login__info}>
        <img src="/login-background.svg" alt="background" className={styles.login__background} />
        <div>
          <img src="/give.svg" alt="give" width="40" />
          Borrow what you need from your neighbours. <br /> Be it tools, games or books.
        </div>
        <div>
          <img src="/community.svg" alt="community" width="40" />
          Form a community.
        </div>
        <div>
          <img src="/high-five.svg" alt="high-five" width="40" />
          Make friends and help each other.
        </div>
      </div>
      <div className={styles.login__form}>
        <div className={styles.login__brand}>
          <Logo />
          <h1>Goodeed</h1>
        </div>
        <div className={styles.login__inputs}>
          <Input name="Username" type="text" showLabel value={username} onInputChange={val => setUsername(val)} />
          <Input name="Password" type="password" showLabel value={password} onInputChange={val => setPassword(val)} />
        </div>
        {validationMessage && <ErrorMessage message={validationMessage} />}

        {isRegister ? (
          <Button
            name="Register"
            loading={isRegisterLoading}
            disabled={!username || !password}
            onButtonClick={() => register({ variables: { username, password } })}
          />
        ) : (
          <Button
            name="Login"
            loading={isLoginLoading}
            disabled={!username || !password}
            onButtonClick={() => login({ variables: { username, password } })}
          />
        )}

        <p className={styles.login__prompt} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Login here.' : 'Dont have an account yet? Register here'}
        </p>
      </div>
    </div>
  );
};

export default Login;
