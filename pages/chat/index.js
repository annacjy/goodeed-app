import { useState, useEffect } from 'react';

import withLayout from 'components/Layout';
import ChatHistory from 'components/ChatHistory';
import Chatbox from 'components/Chatbox';
import NoSsr from 'components/NoSsr';

import styles from './styles.module.scss';

function Chat() {
  const [chatParticipants, setChatParticipants] = useState(null);

  return (
    <section className={styles.chatPage}>
      <ChatHistory onChatClick={({ user, chatPerson, _id }) => setChatParticipants({ user, chatPerson, _id })} />
      {chatParticipants ? <Chatbox chatParticipants={chatParticipants} /> : 'no participant selected'}
    </section>
  );
}

export default withLayout(Chat);
