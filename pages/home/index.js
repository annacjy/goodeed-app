import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import Input from 'components/Input';
import Button from 'components/Button';
import Post from 'components/Post';
import UserContext from 'components/UserContext';
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

  const UPDATE_LOCATION = gql`
    mutation UpdateLocation($lat: Number!, $lng: Number!) {
      updateLocation(lat: $lat, lng: $lng) {
        username
      }
    }
  `;

  const { loading, error } = useQuery(GET_POSTS, {
    onCompleted: data => setPosts(data.posts),
  });

  const [createPost, newPostRes] = useMutation(CREATE_POST);
  const [updateLocation] = useMutation(UPDATE_LOCATION, {
    onCompleted: data => console.log(data),
  });

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [geolocationError, setGeolocationError] = useState('');

  const { user } = useContext(UserContext);

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

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          updateLocation({ variables: { lat, lng } });
        },
        error => {
          if (error.code === 1) setGeolocationError('Seems like you have denied access to geolocation.');
          if (error.code === 2) setGeolocationError('Position unavailable.');
          if (error.code === 3) setGeolocationError('Timeout expired.');
        },
        { maximumAge: 60000, timeout: 3000, enableHighAccuracy: true }
      );
    } else {
      throw new Error('Geolocation is not available');
    }
  };

  return (
    <section>
      {user && !user.location && (
        <div>
          you haven't added your current location. The posts you see now might not be close to you at all
          <p onClick={getLocation}>Find your current location</p>
          {geolocationError && (
            <div>
              <p>{geolocationError}</p>
              <p>Please go to Dashboard > Edit profile > Location and update your location for better experience.</p>
            </div>
          )}
        </div>
      )}
      <div>
        <textarea onChange={e => setNewPost(e.target.value)} />
        <Button name="Post" onButtonClick={addNewPost} />
      </div>
      <div>{loading ? 'loading' : posts.map(post => <Post key={post._id} post={post} />)}</div>
    </section>
  );
};

Home.getInitialProps = async ctx => {
  console.log(ctx);
};

export default withLayout(Home);
