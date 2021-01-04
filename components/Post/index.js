import styles from './styles.module.scss';
import { useState, useContext } from 'react';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useRouter } from 'next/router';
import Button from 'components/Button';
import Avatar from 'components/Avatar';
import Flag from 'components/Flag';
import Comment from 'components/Comment';
import Modal from 'components/Modal';
import UserContext from 'components/UserContext';
import { dateTimeFormatter } from 'utils/functions';

const Post = ({ post, isModifiable }) => {
  const [isCommentFormVisible, setIsCommentFormVisible] = useState(false);
  const [isBorrowConfirmationModalVisible, setIsBorrowConfirmationModalVisible] = useState(false);
  const [isDeleteConfirmationModalVisible, setIsDeleteConfirmationModalVisible] = useState(false);
  const [comments, setComments] = useState([]);

  const [user] = useContext(UserContext);

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
    onCompleted: () => router.reload(),
  });

  const [removePost] = useMutation(REMOVE_POST, {
    onCompleted: () => router.reload(),
  });

  const openComments = id => {
    if (post.comments.length) getComments({ variables: { id } });
    setIsCommentFormVisible(!isCommentFormVisible);
  };

  return (
    <div className={styles.post}>
      <div className={styles.post__content}>
        <div className={styles.post__header}>
          {/* TODO: avatar 1col, name and text another col. same goes for comment */}
          <div className={styles.post__avatar}>
            <Avatar src={post.content.user.userImage} alt={post.content.user.username} size="small" />

            <div className={styles.post__avatar_name}>
              <p>{post.content.user.displayName}</p>
              <span>@{post.content.user.username}</span>
            </div>
            <div className={styles.post__flags}>{post.status === 'BORROWED' && <Flag name="borrowed" />}</div>
          </div>
          <div className={styles.post__actionButtons}>
            {isModifiable && post.status !== 'BORROWED' && (
              <>
                <Button
                  name="Set to 'Borrowed'"
                  theme="green"
                  onButtonClick={() => setIsBorrowConfirmationModalVisible(true)}
                />

                {isBorrowConfirmationModalVisible && (
                  <Modal
                    header="Update Post"
                    isModalVisible={isBorrowConfirmationModalVisible}
                    onModalClose={() => setIsBorrowConfirmationModalVisible(false)}
                  >
                    <div className={styles.post__confirmationModal}>
                      <h2>Have you borrowed this item?</h2>
                      <Button
                        name="Yes, update this post to 'Borrowed'"
                        theme="green"
                        onButtonClick={() => updatePostStatus({ variables: { id: post._id } })}
                      />
                    </div>
                  </Modal>
                )}
              </>
            )}
            {isModifiable && (
              <>
                <Button
                  name="Delete post"
                  theme="red"
                  onButtonClick={() => setIsDeleteConfirmationModalVisible(true)}
                />

                {isDeleteConfirmationModalVisible && (
                  <Modal
                    header="Delete Post"
                    isModalVisible={isDeleteConfirmationModalVisible}
                    onModalClose={() => setIsDeleteConfirmationModalVisible(false)}
                  >
                    <div className={styles.post__confirmationModal}>
                      <h2>Are you sure you want to delete this post?</h2>
                      <Button
                        name="Yes, I want to remove this post"
                        theme="red"
                        onButtonClick={() => removePost({ variables: { id: post._id } })}
                      />
                    </div>
                  </Modal>
                )}
              </>
            )}
            {(user && user.username) !== post.content.user.username && (
              <Button
                name="Message"
                onButtonClick={() => router.push({ pathname: '/chat', query: { with: post.content.user.username } })}
              />
            )}
          </div>
        </div>

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
