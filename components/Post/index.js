import styles from './styles.module.scss';
import { useState, useContext } from 'react';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useRouter } from 'next/router';
import Button from 'components/Button';
import Avatar from 'components/Avatar';
import Flag from 'components/Flag';
import Comment from 'components/Comment';
import UserContext from 'components/UserContext';
import { dateTimeFormatter } from 'utils/functions';

const Post = ({ post, isModifiable }) => {
  const [isCommentFormVisible, setIsCommentFormVisible] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
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
          userImage
          displayName
        }
      }
    }
  `;

  const UPDATE_POST_STATUS = gql`
    mutation UpdatePostStatus($id: String!) {
      updatePostStatus(id: $id) {
        ok
        message
      }
    }
  `;

  const REMOVE_POST = gql`
    mutation RemovePost($id: String!) {
      removePost(id: $id) {
        ok
        message
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
          displayName
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

  const [updatePostStatus] = useMutation(UPDATE_POST_STATUS, {
    onCompleted: data => router.reload(),
  });

  const [removePost] = useMutation(REMOVE_POST, {
    onCompleted: data => router.reload(),
  });

  const openComments = id => {
    getComments({ variables: { id } });
    setIsCommentFormVisible(!isCommentFormVisible);
  };

  return (
    <div className={styles.post}>
      <div className={styles.post__content}>
        <div className={styles.post__header}>
          <div className={styles.post__avatar}>
            <Avatar src={post.content.user.userImage} alt={post.content.user.username} size="small" />

            <div className={styles.post__avatar_name}>
              <p>{post.content.user.displayName}</p>
              <span>@{post.content.user.username}</span>
            </div>
          </div>

          <div className={styles.post__flags}>
            {post.isUrgent && <Flag name="urgent" />}
            {post.status === 'BORROWED' && <Flag name="borrowed" />}
          </div>
        </div>
        // TODO: borrowed and delete post require another modal to confirm action before proceed
        {isModifiable && post.status !== 'BORROWED' && (
          <Button
            name="Borrowed"
            theme="green"
            onButtonClick={() => updatePostStatus({ variables: { id: post._id } })}
          />
        )}
        {isModifiable && (
          <Button name="Delete post" theme="red" onButtonClick={() => removePost({ variables: { id: post._id } })} />
        )}
        {(user && user.username) !== post.content.user.username && (
          <Button
            name="Message"
            onButtonClick={() => router.push({ pathname: '/chat', query: { with: post.content.user.username } })}
          />
        )}
        <p className={styles.post__text}>{post.content.text}</p>
        {post.content.image && <img src={post.content.image} alt="post image" className={styles.post__image} />}
        <div className={styles.post__actions}>
          <span className={styles.post__actions_date}>{post.content.createdAt}</span>
          <div className={styles.post__actions_comment} onClick={() => openComments(post._id)}>
            <img src="/speech-bubble.svg" alt="comments" width="17" />
            <span>{post.comments.length}</span>
          </div>
        </div>
      </div>
      {isCommentFormVisible && (
        <Comment
          comments={comments}
          loading={loading}
          handlePostComment={comment =>
            postComment({ variables: { text: comment, createdAt: dateTimeFormatter(new Date()), id: post._id } })
          }
        />
      )}
    </div>
  );
};

export default Post;
