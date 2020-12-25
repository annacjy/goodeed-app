import { useQuery, useMutation } from '@apollo/react-hooks';
import { useState, useEffect } from 'react';
import gql from 'graphql-tag';
import withLayout from 'components/Layout';
import Post from 'components/Post';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [activePosts, setActivePosts] = useState([]);

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

  const { loading, error, data } = useQuery(GET_USER_POSTS);

  useEffect(() => {
    if (data) {
      const filtered = data.userPost.filter(({ status }) => status !== 'TO_BORROW');
      activeTab === 'all' ? setActivePosts(data.userPost) : setActivePosts(filtered);
    }
  }, [activeTab, data]);

  return (
    <div>
      <div>
        <span onClick={() => setActiveTab('all')}>All</span>
        <span onClick={() => setActiveTab('closed')}>Borrowed / Closed</span>
      </div>
      <div>
        {loading ? 'loading' : activePosts.map(post => <Post key={post._id} post={post} isModifiable={true} />)}
      </div>
    </div>
  );
};

export default withLayout(Dashboard);
