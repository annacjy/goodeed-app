import { useQuery, useMutation } from '@apollo/react-hooks';
import { useState, useEffect, useContext } from 'react';
import Autocomplete from 'react-google-autocomplete';
import gql from 'graphql-tag';
import withLayout from 'components/Layout';
import Post from 'components/Post';
import Button from 'components/Button';
import Input from 'components/Input';
import Avatar from 'components/Avatar';
import Modal from 'components/Modal';
import UserContext from 'components/UserContext';

import styles from './styles.module.scss';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [activePosts, setActivePosts] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fieldsToUpdate, setFieldsToUpdate] = useState({});

  const { user } = useContext(UserContext);

  const GET_USER_POSTS = gql`
    query {
      userPost {
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
    onCompleted: data => console.log(data),
  });

  useEffect(() => {
    if (data) {
      const filtered = data.userPost.filter(({ status }) => status !== 'TO_BORROW');
      activeTab === 'all' ? setActivePosts(data.userPost) : setActivePosts(filtered);
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
    }
  };

  return (
    <div className={styles.dashboard}>
      {user && (
        <div>
          <Avatar src={user.userImage} alt={user.username} size="medium" />
          <h2>{user.displayName}</h2>
          <p>@{user.username}</p>
          <Button name="Edit profile" onButtonClick={() => setIsEditingProfile(true)} />
        </div>
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
            <Avatar
              src={user.userImage}
              alt={user.username}
              size="medium"
              isModifiable={true}
              onFileUploaded={url => setFieldsToUpdate(prev => ({ ...prev, userImage: url }))}
            />

            <Autocomplete
              style={{ width: '90%' }}
              types={['address']}
              defaultValue={(user.location && user.location.address) || ''}
              onPlaceSelected={place => setLatLng(place)}
            />

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

      <div>
        <span onClick={() => setActiveTab('all')}>All</span>
        <span onClick={() => setActiveTab('borrowed')}>Borrowed</span>
      </div>
      <div>
        {loading ? 'loading' : activePosts.map(post => <Post key={post._id} post={post} isModifiable={true} />)}
      </div>
    </div>
  );
};

export default withLayout(Dashboard);
