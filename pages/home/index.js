import { useState } from 'react';
import { useRouter } from 'next/router';
import Input from 'components/Input';
import Button from 'components/Button';
import Post from 'components/Post';
import withLayout from 'components/Layout';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import dateTimeFormatter from 'utils/dateTimeFormat';

const Home = () => {
  const GET_POSTS = gql`
    query {
      posts {
        _id
        content {
          text
          createdAt
          user {
            username
          }
        }
        status
        comments {
          text
          user {
            username
          }
          createdAt
        }
      }
    }
  `;

  const CREATE_POST = gql`
    mutation CreatePost($text: String!, $createdAt: String!) {
      createPost(text: $text, createdAt: $createdAt) {
        content {
          text
          createdAt
          user {
            username
          }
        }
        status
      }
    }
  `;
  const { loading, error, data } = useQuery(GET_POSTS);

  const [createPost, newPostRes] = useMutation(CREATE_POST);

  const [newPost, setNewPost] = useState('');

  if (error) return <p>{error.message}</p>;

  const addNewPost = () => {
    createPost({
      variables: { text: newPost, createdAt: dateTimeFormatter(new Date()) },
      update: (cache, { data: { createPost } }) => {
        const data = cache.readQuery({ query: GET_POSTS });
        const updatedData = [...data.posts, createPost];
        cache.writeQuery({ query: GET_POSTS }, updatedData);
      },
    });
  };

  return (
    <section>
      <div>
        <textarea onChange={e => setNewPost(e.target.value)} />
        <Button name="Post" onButtonClick={addNewPost} />
      </div>
      <div>{loading ? 'loading' : data.posts.map(post => <Post key={post._id} post={post} />)}</div>
    </section>
  );
};

export default withLayout(Home);
