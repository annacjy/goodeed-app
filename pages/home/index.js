import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import Input from 'components/Input';
import Button from 'components/Button';
import Post from 'components/Post';
import Avatar from 'components/Avatar';
import TextArea from 'components/TextArea';
import LoadingSkeleton from 'components/LoadingSkeleton';
import Error from 'components/Error';
import UserContext from 'components/UserContext';
import withLayout from 'components/Layout';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import styles from './styles.module.scss';

import { dateTimeFormatter } from 'utils/functions';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [pageInfo, setPageInfo] = useState(null);
  const [previewFile, setPreviewFile] = useState('');
  const [imageToBeUploaded, setImageToBeUploaded] = useState(null);

  const [user] = useContext(UserContext);

  const GET_POSTS = gql`
    query GetPosts($cursor: String) {
      posts(cursor: $cursor) {
        pageInfo {
          nextCursor
        }
        data {
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

  const { loading, error, fetchMore } = useQuery(GET_POSTS, {
    fetchPolicy: 'network-only',
    onCompleted: data => {
      setPosts(data.posts.data);
      setPageInfo(data.posts.pageInfo);
    },
  });

  const onScroll = e => {
    // if div is at the bottom, fetch more posts
    if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight) {
      // if there are no more posts to fetch, dont do anything
      if (!pageInfo.nextCursor) return;
      fetchMorePosts();

      return;
    }
  };

  const fetchMorePosts = async () => {
    const fetchedMore = await fetchMore({
      variables: { cursor: pageInfo.nextCursor },
    });

    setPageInfo(fetchedMore.data.posts.pageInfo);
    setPosts(previousPosts => [...previousPosts, ...fetchedMore.data.posts.data]);
  };

  const [createPost] = useMutation(CREATE_POST, {
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

  if (error) return <Error errorMessage={error.message} />;
  if (loading) return <LoadingSkeleton type="posts" />;

  return (
    <section onScroll={onScroll} className={styles.home}>
      {user && (
        <>
          {!user.location && (
            <div>
              You haven't added your current location. The posts you see now might not be close to you at all
              {/* TODO: put an edit modal here to update location if theres time */}
              <p onClick={() => router.push('/dashboard')}>Update your location</p>
            </div>
          )}
          <div className={styles.home__addPost}>
            <div className={styles.home__addPost_post}>
              <Avatar src={user.userImage} alt={user.username} size="small" />
              <div className={styles.home__addPost_textarea}>
                <TextArea placeholder="I need to borrow..." onContentChange={val => setNewPost(val)} />

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
              <Button name="Post" onButtonClick={addNewPost} />
            </div>
          </div>
        </>
      )}

      <div>
        {posts.map(post => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default withLayout(Home);
