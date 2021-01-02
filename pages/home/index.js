import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import Input from 'components/Input';
import Button from 'components/Button';
import Post from 'components/Post';
import Avatar from 'components/Avatar';
import Tabs from 'components/Tabs';
import TextArea from 'components/TextArea';
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
  const [isPostUrgent, setIsPostUrgent] = useState(false);
  const [activeTab, setActiveTab] = useState('All (by distance)');

  const { user } = useContext(UserContext);

  const GET_POSTS = gql`
    query {
      posts {
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
        isUrgent
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
    mutation CreatePost($text: String!, $isUrgent: Boolean, $image: String, $createdAt: String!) {
      createPost(text: $text, isUrgent: $isUrgent, image: $image, createdAt: $createdAt) {
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
        isUrgent
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

  const { loading, error } = useQuery(GET_POSTS, {
    onCompleted: data => setPosts(data.posts),
  });

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
        ...(isPostUrgent && { isUrgent: true }),
        createdAt: dateTimeFormatter(new Date()),
      },
      update: (cache, { data: { createPost } }) => {
        const data = cache.readQuery({ query: GET_POSTS });
        const updatedData = [...data.posts, createPost];
        cache.writeQuery({ query: GET_POSTS }, updatedData);
      },
    });

    // reset post inputs
    setPreviewFile('');
    setNewPost('');
    setImageToBeUploaded('');
    setIsPostUrgent(false);
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

  // TODO: filter by urgent

  if (error) return <p>{error.message}</p>;

  return (
    <section className={styles.home}>
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

                <img
                  src={isPostUrgent ? '/urgent-marked.svg' : '/urgent.svg'}
                  alt="urgent"
                  className={`${styles.home__addPost_urgent} ${
                    styles[`home__addPost_urgent${isPostUrgent && '--active'}`]
                  }`}
                  onClick={() => setIsPostUrgent(!isPostUrgent)}
                />
                {isPostUrgent && (
                  <span style={{ color: '#ec483c', marginLeft: '5px' }}>This post is flagged as urgent.</span>
                )}
              </div>
              <Button name="Post" onButtonClick={addNewPost} />
            </div>
          </div>
        </>
      )}

      <Tabs tabs={['All (by distance)', 'Urgent']} active={activeTab} onTabClick={e => setActiveTab(e)} />
      <div>{loading ? 'loading' : posts.map(post => <Post key={post._id} post={post} />)}</div>
    </section>
  );
};

export default withLayout(Home);
