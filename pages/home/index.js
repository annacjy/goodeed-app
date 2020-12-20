import { useState } from 'react';
import { useRouter } from 'next/router';
import Input from 'components/Input';
import Button from 'components/Button';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

export default function Home() {
  return (
    <section>
      <div>Textarea to input and send button</div>
      <div>Feed with infinity scroll</div>
    </section>
  );
}
