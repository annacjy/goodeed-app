import { useState, useEffect, useContext } from 'react';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useRouter } from 'next/router';
import UserContext from 'components/UserContext';

import withLayout from 'components/Layout';
import Messages from 'components/Messages';
import Avatar from 'components/Avatar';

import styles from './styles.module.scss';

function Chat() {
  const [chatHistory, setChatHistory] = useState(null);
  const [chatParticipants, setChatParticipants] = useState(null);
  const [initialFetch, setInitialFetch] = useState(false);

  const contextUser = useContext(UserContext);
  const router = useRouter();

  const GET_CHATS = gql`
    query {
      chats {
        _id
        participants {
          username
          displayName
          userImage
        }
        username
        messages {
          from
          to
          message
          createdAt
        }
      }
    }
  `;

  const GET_CHAT_USER = gql`
    query ChatUser($username: String!) {
      chatUser(username: $username) {
        username
        displayName
        userImage
      }
    }
  `;

  const { loading, error } = useQuery(GET_CHATS, {
    fetchPolicy: 'network-only',
    onCompleted: data => {
      setChatHistory(
        data.chats.map(data => {
          const matchedUser = data.participants.find(person => person.username !== data.username);
          return { ...data, matchedUser, lastMessage: data.messages[data.messages.length - 1] };
        })
      );

      setInitialFetch(true);
    },
  });

  const [getChatUser, { data }] = useLazyQuery(GET_CHAT_USER);

  const handleChatParticipants = ({ matchedUser, username, _id }) => {
    router.push({ pathname: '/chat', query: { with: matchedUser.username } });
    setChatParticipants({ user: username, chatPerson: matchedUser, _id });
  };

  useEffect(() => {
    const currentPersonToChat = router.query.with;

    if (initialFetch && currentPersonToChat) {
      const chatHistoryIndex = chatHistory.findIndex(({ matchedUser }) => matchedUser.username === currentPersonToChat);

      // check if chat history has this person matched, if so setChatParticipants there
      if (chatHistoryIndex !== -1) {
        const { _id, username, matchedUser } = chatHistory[chatHistoryIndex];

        setChatParticipants({ user: username, _id, chatPerson: matchedUser });
      } else {
        // else, this current person to chat is new, not in history. set chatHistory
        getChatUser({ variables: { username: currentPersonToChat } });

        if (data && contextUser) {
          const newPersonToChat = { matchedUser: data.chatUser };

          setChatHistory(prevHistory => {
            const prev = [...prevHistory];
            prev.unshift(newPersonToChat);
            return prev;
          });

          setChatParticipants({ user: contextUser.user.username, chatPerson: data.chatUser });
        }
      }
    }
  }, [router, contextUser, data, initialFetch]);

  if (loading) return <p>Loading</p>;
  if (error) return <p>Error</p>;

  return (
    <section className={styles.chatPage}>
      <div className={styles.chatPage__history}>
        {initialFetch &&
          chatHistory.map(({ matchedUser, username, _id, lastMessage }) => (
            <div
              key={_id}
              onClick={() =>
                handleChatParticipants({
                  matchedUser,
                  username,
                  _id,
                })
              }
            >
              <div className={styles.chatPage__history_avatar}>
                <Avatar src={matchedUser.userImage} alt={matchedUser.username} size="medium" />
                <div className={styles.chatPage__history_message}>
                  <h1>{matchedUser.displayName}</h1>
                  {lastMessage && <p>{lastMessage.message}</p>}
                </div>
              </div>
              <p>{lastMessage && lastMessage.createdAt}</p>
            </div>
          ))}
      </div>

      <div className={styles.chatPage__messages}>
        {chatParticipants ? (
          <>
            <div className={styles.chatPage__messages_header}>
              <Avatar
                src={chatParticipants.chatPerson.userImage}
                alt={chatParticipants.chatPerson.username}
                size="medium"
              />
              <h1>{chatParticipants.chatPerson.displayName}</h1>
            </div>
            <Messages chatParticipants={chatParticipants} />
          </>
        ) : (
          'no participant selected'
        )}
      </div>
    </section>
  );
}

export default withLayout(Chat);
