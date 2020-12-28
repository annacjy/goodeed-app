import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import withLayout from 'components/Layout';
import Messages from 'components/Messages';

import styles from './styles.module.scss';

function Chat() {
  const [chatHistory, setChatHistory] = useState(null);
  const [chatParticipants, setChatParticipants] = useState(null);

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

  const { loading, error } = useQuery(GET_CHATS, {
    onCompleted: data => {
      setChatHistory(
        data.chats.messageData.map(({ participants, _id }) => {
          const matchedPerson = participants.find(person => person !== data.chats.user);
          return { _id, matchedPerson, user: data.chats.user };
        })
      );
    },
  });

  if (loading) return <p>Loading</p>;
  if (error) return <p>Error</p>;

  return (
    <section className={styles.chatPage}>
      <div>
        {chatHistory &&
          chatHistory.map(({ matchedPerson, user, _id }) => (
            <div key={_id} onClick={() => setChatParticipants({ user, chatPerson: matchedPerson, _id })}>
              <h1>{matchedPerson}</h1>
            </div>
          ))}
      </div>

      {chatParticipants ? <Messages chatParticipants={chatParticipants} /> : 'no participant selected'}
    </section>
  );
}

export default withLayout(Chat);
