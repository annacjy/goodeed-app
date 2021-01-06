import styles from './styles.module.scss';
import { useState, useContext } from 'react';
import Avatar from 'components/Avatar';
import TextArea from 'components/TextArea';
import LoadingSkeleton from 'components/LoadingSkeleton';
import Spinner from 'components/Spinner';
import ErrorMessage from 'components/ErrorMessage';
import UserContext from 'components/UserContext';

const Comment = ({ comments, loading, postCommentLoading, postCommentError, handlePostComment }) => {
  const [comment, setComment] = useState('');
  const [user] = useContext(UserContext);

  return (
    <div className={styles.comment}>
      <div className={styles.comment__addComment}>
        <Avatar src={user.userImage} alt={user.username} size="small" />
        <TextArea
          placeholder="Add your comment here"
          hasBorder
          value={comment}
          onContentChange={content => setComment(content)}
          onEnter={() => {
            handlePostComment(comment);
            setComment('');
          }}
        />
      </div>
      {loading ? (
        <LoadingSkeleton type="comment" noPad />
      ) : (
        <>
          {postCommentLoading && (
            <div className={styles.comment__element}>
              <Spinner color="primary" />
            </div>
          )}

          {postCommentError && (
            <div className={styles.comment__element}>
              <ErrorMessage message={postCommentError} />
            </div>
          )}

          {comments.map(({ text, user: { username, userImage, displayName }, createdAt }, index) => (
            <div key={`${index}-${createdAt}`} className={styles.comment__element}>
              <div className={styles.comment__element_avatar}>
                <div>
                  <Avatar src={userImage} alt={username} size="small" />
                  <div className={styles.comment__element_userInfo}>
                    <p>{displayName}</p>
                    <span>@{username}</span>
                  </div>
                </div>
                <p className={styles.comment__element_createdAt}>{createdAt}</p>
              </div>
              <p className={styles.comment__element_text}>{text}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Comment;
