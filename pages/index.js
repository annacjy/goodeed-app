import styles from './login.module.scss';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Cookies from 'js-cookie';

import Input from 'components/Input';
import Button from 'components/Button';

export default function Login() {
  const router = useRouter();

  const LOGIN_USER = gql`
    mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        token
        username
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

  const [login, loginRes] = useMutation(LOGIN_USER);
  const [register, registerRes] = useMutation(REGISTER_USER);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (loginRes.data) {
      const { status, token } = loginRes.data && loginRes.data.login;
      if (status.ok) {
        Cookies.set('token', token, { expires: 1 });

        router.replace('/home');
      }
    }
  }, [loginRes.data]);

  return (
    <div className={styles.login}>
      <div className={styles.login__info}>
        <h1>Goodeed.</h1>
        <p>Features</p>
        <img src="/help.svg" alt="logo" />
      </div>
      <div className={styles.login__form}>
        <div>
          <Input name="username" type="text" showLabel value={username} onInputChange={val => setUsername(val)} />
          <Input name="password" type="password" showLabel value={password} onInputChange={val => setPassword(val)} />
        </div>
        <Button
          name="Login"
          disabled={!username || !password}
          onButtonClick={() => login({ variables: { username, password } })}
        />
        <Button
          name="Register"
          disabled={!username || !password}
          onButtonClick={() => register({ variables: { username, password } })}
        />
        <p>dont have an account? register here</p>
      </div>
    </div>
  );
}
