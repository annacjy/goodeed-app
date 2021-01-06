import { useState, useEffect, useContext } from 'react';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useRouter } from 'next/router';
import UserContext from 'components/UserContext';

import withLayout from 'components/Layout';
import Messages from 'components/Messages';
import Avatar from 'components/Avatar';
import LoadingSkeleton from 'components/LoadingSkeleton';
import ErrorPage from '@/components/ErrorPage';

import styles from './styles.module.scss';

function Chat() {
  const [chatHistory, setChatHistory] = useState(null);
  const [chatParticipants, setChatParticipants] = useState(null);
  const [matchedUserInfo, setMatchedUserInfo] = useState(null);
  const [initialFetch, setInitialFetch] = useState(false);

  const [user] = useContext(UserContext);
  const router = useRouter();

  const GET_CHATS = gql`
    query {
      chats {
        _id
        participants
        username
        lastMessage {
          message
          createdAt
        }
        userChatInfo {
          username
          displayName
          userImage
        }
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
      setChatHistory(data.chats);

      setInitialFetch(true);
    },
  });

  const [getChatUser] = useLazyQuery(GET_CHAT_USER, {
    onCompleted: data => setMatchedUserInfo(data.chatUser),
  });

  const handleChatParticipants = ({ userChatInfo, username, _id }) => {
    router.push({ pathname: '/chat', query: { with: userChatInfo.username } });
    setChatParticipants({ user: username, chatPerson: userChatInfo, _id });
  };

  const removeQuery = () => {
    router.push({ pathname: '/chat', query: {} });
  };

  useEffect(() => {
    const currentPersonToChat = router.query.with;

    if (initialFetch && currentPersonToChat) {
      const chatHistoryIndex = chatHistory.findIndex(({ participants }) => participants.includes(currentPersonToChat));

      // check if chat history has this person matched, if so setChatParticipants there
      if (chatHistoryIndex !== -1) {
        const { _id, username, userChatInfo } = chatHistory[chatHistoryIndex];

        setChatParticipants({ user: username, _id, chatPerson: userChatInfo });
      } else {
        // else, this current person to chat is new, not in history. set chatHistory
        getChatUser({ variables: { username: currentPersonToChat } });

        if (matchedUserInfo && user) {
          const newPersonToChat = { userChatInfo: matchedUserInfo };

          setChatHistory(prevHistory => {
            const prev = [...prevHistory];
            prev.unshift(newPersonToChat);
            return prev;
          });

          setChatParticipants({ user: user.username, chatPerson: matchedUserInfo });
        }
      }
    }
  }, [router, user, matchedUserInfo, initialFetch]);

  if (loading) return <LoadingSkeleton type="chat" />;
  if (error) return <ErrorPage errorMessage={error.message} />;

  return (
    <>
      <section className={styles.chatPage}>
        <div className={styles.chatPage__history}>
          {initialFetch &&
            chatHistory.map(({ userChatInfo, username, _id, lastMessage }) => (
              <div
                key={_id}
                className={`${userChatInfo.username === router.query.with && styles['chatPage__history--activeChat']}`}
                onClick={() =>
                  handleChatParticipants({
                    userChatInfo,
                    username,
                    _id,
                  })
                }
              >
                <div className={styles.chatPage__history_avatar}>
                  <Avatar src={userChatInfo.userImage} alt={userChatInfo.username} size="small" />
                  <div className={styles.chatPage__history_message}>
                    <h1>{userChatInfo.displayName}</h1>
                    {lastMessage && <p>{lastMessage.message}</p>}
                  </div>
                </div>
                <p className={styles.chatPage__history_time}>{lastMessage && lastMessage.createdAt}</p>
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
                  size="small"
                />
                <h1>{chatParticipants.chatPerson.displayName}</h1>
              </div>
              <Messages chatParticipants={chatParticipants} />
            </>
          ) : (
            <div className={styles.chatPage__noParticipants}>
              <h1>You don't have a message selected</h1>
              <p>Please select someone you would like to chat with</p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.chatPageMobile}>
        {!router.query.with ? (
          <div className={styles.chatPageMobile__history}>
            {initialFetch &&
              chatHistory.map(({ userChatInfo, username, _id, lastMessage }) => (
                <div
                  key={_id}
                  onClick={() =>
                    handleChatParticipants({
                      userChatInfo,
                      username,
                      _id,
                    })
                  }
                >
                  <div className={styles.chatPageMobile__history_avatar}>
                    <Avatar src={userChatInfo.userImage} alt={userChatInfo.username} size="small" />
                    <div className={styles.chatPageMobile__history_message}>
                      <h1>{userChatInfo.displayName}</h1>
                      {lastMessage && <p>{lastMessage.message}</p>}
                    </div>
                  </div>
                  <p className={styles.chatPageMobile__history_time}>{lastMessage && lastMessage.createdAt}</p>
                </div>
              ))}
          </div>
        ) : (
          <div className={styles.chatPageMobile__messages}>
            {chatParticipants ? (
              <>
                <div className={styles.chatPageMobile__messages_header}>
                  <img
                    src="/back.svg"
                    alt="back"
                    className={styles.chatPageMobile__messages_back}
                    onClick={removeQuery}
                  />
                  <Avatar
                    src={chatParticipants.chatPerson.userImage}
                    alt={chatParticipants.chatPerson.username}
                    size="small"
                  />
                  <h1>{chatParticipants.chatPerson.displayName}</h1>
                </div>
                <Messages chatParticipants={chatParticipants} />
              </>
            ) : (
              <div className={styles.chatPageMobile__noParticipants}>
                <h1>You don't have a message selected</h1>
                <p>Please select someone you would like to chat with</p>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}

export default withLayout(Chat);
