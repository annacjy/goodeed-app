const Post = ({ post }) => {
  return (
    <div>
      <p>Username: {post.content.user.username}</p>
      <p>{post.content.text}</p>
      <span>{post.content.createdAt}</span>
      <span>{post.status}</span>
      <span>{post.comments}</span>
    </div>
  );
};

export default Post;
