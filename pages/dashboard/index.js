import { useQuery, useMutation } from '@apollo/react-hooks';
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Autocomplete from 'react-google-autocomplete';
import gql from 'graphql-tag';
import withLayout from 'components/Layout';
import Post from 'components/Post';
import Button from 'components/Button';
import Input from 'components/Input';
import Avatar from 'components/Avatar';
import Modal from 'components/Modal';
import Tabs from 'components/Tabs';
import LoadingSkeleton from 'components/LoadingSkeleton';
import UserContext from 'components/UserContext';

import styles from './styles.module.scss';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [activePosts, setActivePosts] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fieldsToUpdate, setFieldsToUpdate] = useState({});
  const [updateFail, setUpdateFail] = useState(null);
  const [userPostsStats, setUserPostsStats] = useState(null);

  const [user] = useContext(UserContext);
  const router = useRouter();

  const GET_USER_POSTS = gql`
    query {
      userPost {
        _id
        content {
          text
          createdAt
          user {
            username
            displayName
            userImage
          }
          image
        }
        status
        comments {
          text
          createdAt
          user {
            username
          }
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

  const { loading, error, data } = useQuery(GET_USER_POSTS);
  const [updateUser] = useMutation(UPDATE_USER, {
    onCompleted: data => {
      if (data.updateUser.ok) {
        setIsEditingProfile(false);
        router.reload();
      } else {
        setUpdateFail('true');
      }
    },
  });

  useEffect(() => {
    if (data) {
      const filtered = data.userPost.filter(({ status }) => status !== 'TO_BORROW');
      activeTab === 'All' ? setActivePosts(data.userPost) : setActivePosts(filtered);

      setUserPostsStats({
        all: data.userPost.length,
        borrowed: filtered.length,
      });
    }
  }, [activeTab, data]);

  const setLatLng = place => {
    const {
      geometry: { location },
      formatted_address,
    } = place;
    const lat = location.lat();
    const lng = location.lng();

    setFieldsToUpdate(prev => ({ ...prev, location: { lat, lng, address: formatted_address } }));
  };

  const handleUpdateUser = () => {
    if (Object.keys(fieldsToUpdate).length) {
      updateUser({ variables: { fieldsToUpdate } });
      setUpdateStatus('loading');
    }
  };

  if (loading) return <LoadingSkeleton type="posts" />;

  return (
    <div className={styles.dashboard}>
      {user ? (
        <div className={styles.dashboard__profile}>
          <div className={styles.dashboard__profile_header}>
            <Avatar src={user.userImage} alt={user.username} size="large" />
            <div className={styles.dashboard__profile_userInfo}>
              <div>
                <h2>{user.displayName}</h2>
                <p>@{user.username}</p>
              </div>

              {userPostsStats && (
                <div className={styles.dashboard__profile_postStats}>
                  <p>
                    <strong>{userPostsStats.all}</strong> Posts
                  </p>
                  <p>
                    <strong>{userPostsStats.borrowed}</strong> Borrowed
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button name="Edit profile" onButtonClick={() => setIsEditingProfile(true)} />
        </div>
      ) : (
        <LoadingSkeleton type="profile" />
      )}
      {isEditingProfile && (
        <Modal
          header="Edit profile"
          isModalVisible={isEditingProfile}
          hasSaveButton={true}
          onModalClose={() => setIsEditingProfile(false)}
          onSave={handleUpdateUser}
        >
          <div className={styles.dashboard__edit}>
            {updateFail === 'true' && <p>Error while updating. Please try again.</p>}
            <div className={styles.dashboard__edit_avatar}>
              <Avatar
                src={user.userImage}
                alt={user.username}
                size="large"
                isModifiable={true}
                onFileConversion={base64 => {
                  setFieldsToUpdate(prev => ({ ...prev, userImage: base64 }));
                }}
              />
            </div>

            <div className={styles.dashboard__edit_locationInput}>
              <label>Location</label>
              <Autocomplete
                style={{ width: '90%' }}
                types={['address']}
                defaultValue={(user.location && user.location.address) || ''}
                onPlaceSelected={place => setLatLng(place)}
              />
            </div>

            <Input
              name="Display name"
              type="text"
              showLabel={true}
              value={user.displayName}
              onInputChange={displayName =>
                setFieldsToUpdate(prev => ({
                  ...prev,
                  displayName,
                }))
              }
            />
          </div>
        </Modal>
      )}

      <Tabs tabs={['All', 'Borrowed']} active={activeTab} onTabClick={e => setActiveTab(e)} />

      <div className={styles.dashboard__posts}>
        {activePosts.map(post => (
          <Post key={post._id} post={post} isModifiable={true} />
        ))}
      </div>
    </div>
  );
};

export default withLayout(Dashboard);
