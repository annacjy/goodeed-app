import styles from './styles.module.scss';
import { useState, useContext } from 'react';
import Button from 'components/Button';
import Avatar from 'components/Avatar';
import TextArea from 'components/TextArea';
import UserContext from 'components/UserContext';

const Comment = ({ comments, loading, handlePostComment }) => {
  const [comment, setComment] = useState('');

  const { user } = useContext(UserContext);

  return (
    <div className={styles.comment}>
      <div className={styles.comment__addComment}>
        <Avatar src={user.userImage} alt={user.username} size="small" />
        <TextArea
          placeholder="Add your comment here"
          hasBorder
          onContentChange={content => setComment(content)}
          onEnter={() => handlePostComment(comment)}
        />
      </div>
      {loading ? (
        <p>loading...</p>
      ) : (
        comments.map(({ text, user: { username, userImage, displayName }, createdAt }, index) => (
          <div key={`${index}-${createdAt}`} className={styles.comment__element}>
            <div className={styles.comment__element_avatar}>
              <div>
                <Avatar src={userImage} alt={username} size="small" />
                <p>{displayName}</p>
                <span>@{username}</span>
              </div>
              <p className={styles.comment__element_createdAt}>{createdAt}</p>
            </div>
            <p className={styles.comment__element_text}>{text}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Comment;
