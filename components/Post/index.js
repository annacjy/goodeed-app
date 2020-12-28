import styles from './styles.module.scss';
import { useState, useContext } from 'react';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Button from 'components/Button';
import UserContext from 'components/UserContext';
import dateTimeFormatter from 'utils/dateTimeFormat';

const Post = ({ post, isModifiable }) => {
  const [isCommentFormVisible, setIsCommentFormVisible] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const { user } = useContext(UserContext);

  const POST_COMMENT = gql`
    mutation PostComment($text: String!, $createdAt: String!, $id: String!) {
      postComment(text: $text, createdAt: $createdAt, id: $id) {
        text
        createdAt
        user {
          username
        }
      }
    }
  `;

  const GET_COMMENTS = gql`
    query GetComments($id: String!) {
      comments(id: $id) {
        text
        createdAt
        user {
          username
        }
      }
    }
  `;

  const [getComments, { loading }] = useLazyQuery(GET_COMMENTS, {
    onCompleted: data => setComments(prev => [...prev, ...data.comments]),
  });

  const [postComment] = useMutation(POST_COMMENT, {
    onCompleted: data => setComments(prev => [...prev, data.postComment]),
  });

  const handlePostComment = () => {
    postComment({ variables: { text: comment, createdAt: dateTimeFormatter(new Date()), id: post._id } });
  };

  const openComments = id => {
    getComments({ variables: { id } });
    setIsCommentFormVisible(true);
  };

  const openOptions = () => {
    setIsOptionsVisible(true);
  };

  return (
    <div className={styles.post}>
      <div className={styles.post__avatar}>
        <img src="/user.svg" alt="avatar" />
        <div>
          <p>{post.content.user.username}</p>
          <span>{post.content.createdAt}</span>
        </div>
        {user && user.username !== post.content.user.username && (
          <img src="/more.svg" alt="options" width="10" onClick={openOptions} />
        )}
        {isOptionsVisible && <div>dropdown here. chat with {post.content.user.username}</div>}
      </div>
      <p>{isModifiable ? 'borrowed/close' : null}</p>
      <p>{post.content.text}</p>
      <span>{post.status}</span>
      <div onClick={() => openComments(post._id)}>
        <img src="/speech-bubble.svg" alt="comments" width="15" />
        <span>{post.comments.length}</span>
      </div>
      {isCommentFormVisible && (
        <>
          {loading ? (
            <p>loading</p>
          ) : (
            comments.map(({ text, user: { username }, createdAt }) => (
              <div key={createdAt}>
                <p>{username}</p>
                <p>{text}</p>
                <p>{createdAt}</p>
              </div>
            ))
          )}

          <div>
            <textarea onChange={e => setComment(e.target.value)} />
            <Button name="Add a comment" onButtonClick={handlePostComment} />
          </div>
        </>
      )}
    </div>
  );
};

export default Post;
