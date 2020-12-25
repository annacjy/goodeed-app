import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const ChatHistory = ({ onChatClick }) => {
  const GET_CHATS = gql`
    query {
      chats {
        user
        messageData {
          _id
          participants
          messages {
            from
            to
            message
            createdAt
          }
        }
      }
    }
  `;

  const { loading, error, data } = useQuery(GET_CHATS, {
    fetchPolicy: 'network-only',
  });

  let mappedChatHistory;

  if (loading) return <p>Loading</p>;
  if (error) return <p>Error</p>;

  if (data) {
    mappedChatHistory = data.chats.messageData.map(({ participants, _id }) => {
      const matchedPerson = participants.find(person => person !== data.chats.user);
      return { _id, matchedPerson };
    });
  }

  return (
    <div>
      {mappedChatHistory.map(({ matchedPerson, _id }) => (
        <div key={_id} onClick={() => onChatClick({ user: data.chats.user, chatPerson: matchedPerson, _id })}>
          <h1>{matchedPerson}</h1>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
