import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

import Input from 'components/Input';
import Button from 'components/Button';
import Post from 'components/Post';
import Avatar from 'components/Avatar';
import TextArea from 'components/TextArea';
import Modal from 'components/Modal';
import LocationInput from 'components/LocationInput';
import LoadingSkeleton from 'components/LoadingSkeleton';
import Spinner from 'components/Spinner';
import ErrorPage from 'components/ErrorPage';
import UserContext from 'components/UserContext';
import withLayout from 'components/Layout';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import styles from './styles.module.scss';

import { dateTimeFormatter } from 'utils/functions';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [previewFile, setPreviewFile] = useState('');
  const [imageToBeUploaded, setImageToBeUploaded] = useState(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [locationUpdate, setLocationUpdate] = useState({});
  const [offset, setOffset] = useState(0);
  const [isFetchMoreLoading, setIsFetchMoreLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);

  const [user] = useContext(UserContext);
  const router = useRouter();

  const GET_POSTS = gql`
    query GetPosts($offset: Int) {
      posts(offset: $offset) {
        content {
          _id
          content {
            text
            createdAt
            user {
              username
              userImage
              displayName
            }
            image
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
        hasMore
      }
    }
  `;

  const CREATE_POST = gql`
    mutation CreatePost($text: String!, $image: String, $createdAt: String!) {
      createPost(text: $text, image: $image, createdAt: $createdAt) {
        _id
        content {
          text
          createdAt
          user {
            username
            userImage
            displayName
          }
          image
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

  const UPDATE_USER = gql`
    mutation UpdateUser($fieldsToUpdate: UserInput!) {
      updateUser(fieldsToUpdate: $fieldsToUpdate) {
        ok
        message
      }
    }
  `;

  const { loading, error, fetchMore } = useQuery(GET_POSTS, {
    fetchPolicy: 'network-only',
    onCompleted: data => {
      const { content, hasMore } = data.posts;
      setPosts(content);
      setHasMorePosts(hasMore);
    },
  });

  const onScroll = e => {
    // if div is at the bottom, fetch more posts
    if (e.target.scrollTop + e.target.clientHeight === e.target.scrollHeight) {
      // if there are no more posts to fetch, dont do anything
      if (!hasMorePosts) return;

      setTimeout(() => {
        setIsFetchMoreLoading(true);
        fetchMorePosts();
      }, 300);

      return;
    }
  };

  const fetchMorePosts = async () => {
    setOffset(prev => prev + 1);

    const fetchedMore = await fetchMore({
      variables: { offset: offset + 1 },
    });

    const { content, hasMore } = fetchedMore.data.posts;
    setPosts(previousPosts => [...previousPosts, ...content]);
    setHasMorePosts(hasMore);
    setIsFetchMoreLoading(false);
  };

  const [createPost, { loading: createPostLoading, error: createPostError }] = useMutation(CREATE_POST, {
    onCompleted: data =>
      setPosts(previousPosts => {
        const prev = [...previousPosts];
        prev.unshift(data.createPost);
        return prev;
      }),
  });

  const addNewPost = () => {
    createPost({
      variables: {
        text: newPost,
        image: imageToBeUploaded,
        createdAt: dateTimeFormatter(new Date()),
      },
    });

    // reset post inputs
    setPreviewFile('');
    setNewPost('');
    setImageToBeUploaded('');
  };

  const [updateUser, { loading: updateUserLoading }] = useMutation(UPDATE_USER, {
    onCompleted: data => {
      if (data.updateUser.ok) {
        setIsLocationModalVisible(false);
        router.reload();
      }
    },
  });

  const handleFileUpload = e => {
    const fileObject = e.target.files[0];

    // set a preview of image
    const blobUrl = URL.createObjectURL(fileObject);
    setPreviewFile(blobUrl);

    // convertBlobToBase64(fileObject);

    const blob = new Blob([fileObject], { type: fileObject.type });
    let reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
      let base64String = reader.result;
      // set the image file that's to be uploaded if the user clicks post
      setImageToBeUploaded(base64String);
    };
  };

  if (error) return <ErrorPage errorMessage={error.message} />;
  if (loading) return <LoadingSkeleton type="posts" />;

  return (
    <section onScroll={onScroll} className={styles.home}>
      {user ? (
        <>
          {!user.location && (
            <>
              <div className={styles.home__noLocationBanner}>
                You haven't added your current location. <br />
                Please add your location so you can post and see posts close to you.
                <Button name="Set your location" onButtonClick={() => setIsLocationModalVisible(true)} />
              </div>

              {isLocationModalVisible && (
                <Modal
                  header="Add location"
                  isModalVisible={isLocationModalVisible}
                  hasSaveButton={true}
                  loading={updateUserLoading}
                  onModalClose={() => setIsLocationModalVisible(false)}
                  onSave={() => updateUser({ variables: { fieldsToUpdate: { location: locationUpdate } } })}
                >
                  <LocationInput onPlaceSelected={location => setLocationUpdate(location)} />
                </Modal>
              )}
            </>
          )}
          <div className={styles.home__addPost}>
            <div className={styles.home__addPost_post}>
              <Avatar src={user.userImage} alt={user.username} size="small" />
              <div className={styles.home__addPost_textarea}>
                <TextArea value={newPost} placeholder="I need to borrow..." onContentChange={val => setNewPost(val)} />

                {previewFile && (
                  <div className={styles.home__addPost_previewFile}>
                    <img src={previewFile} />
                  </div>
                )}
              </div>
            </div>
            <div className={styles.home__addPost_ctas}>
              <div className={styles.home__addPost_ctas_icons}>
                <label htmlFor="uploadFile" className={styles.home__addPost_upload}>
                  <input id="uploadFile" type="file" accept="image/*" onChange={handleFileUpload} />
                  <img src="/camera.svg" alt="media upload" />
                </label>
              </div>
              {createPostError && <p></p>}
              <Button name="Post" loading={createPostLoading} disabled={!user.location} onButtonClick={addNewPost} />
            </div>
          </div>
        </>
      ) : (
        <LoadingSkeleton type="addPost" />
      )}

      <div>
        {posts.map(post => (
          <Post key={post._id} post={post} />
        ))}
        {isFetchMoreLoading && <Spinner color="primary" />}
      </div>
    </section>
  );
};

export default withLayout(Home);
