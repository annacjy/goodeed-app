import styles from './styles.module.scss';
import { useState, useContext } from 'react';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useRouter } from 'next/router';
import Button from 'components/Button';
import Avatar from 'components/Avatar';
import UserContext from 'components/UserContext';
import { dateTimeFormatter } from 'utils/functions';

const Post = ({ post, isModifiable }) => {
  const [isCommentFormVisible, setIsCommentFormVisible] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const { user } = useContext(UserContext);

  const router = useRouter();

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
          userImage
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

  return (
    <div className={styles.post}>
      <div className={styles.post__avatar}>
        <Avatar src={post.content.user.userImage} alt={post.content.user.username} />

        <div>
          <p>{post.content.user.username}</p>
          <span>{post.content.createdAt}</span>
        </div>

        <img src="/more.svg" alt="options" width="10" onClick={() => setIsOptionsVisible(!isOptionsVisible)} />

        {isOptionsVisible && (
          <div>
            <ul>
              {(user && user.username) !== post.content.user.username ? (
                <li onClick={() => router.push({ pathname: '/chat', query: { with: post.content.user.username } })}>
                  Message {post.content.user.username}
                </li>
              ) : (
                <li>Delete post</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {isModifiable && <Button name="Borrowed" onButtonClick={() => console.log('update status here')} />}
      <p>{post.content.text}</p>
      {post.status !== 'TO_BORROW' && <img src="/handshake.svg" alt="borrowed" width="20" />}
      <div onClick={() => openComments(post._id)}>
        <img src="/speech-bubble.svg" alt="comments" width="15" />
        <span>{post.comments.length}</span>
      </div>
      {isCommentFormVisible && (
        <>
          {loading ? (
            <p>loading</p>
          ) : (
            comments.map(({ text, user: { username, userImage }, createdAt }, index) => (
              <div key={`${index}-${createdAt}`}>
                <Avatar src={userImage} alt={username} size="small" />
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
