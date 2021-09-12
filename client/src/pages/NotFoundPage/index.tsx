import React from 'react';
import { Message, Icon } from 'semantic-ui-react';

const NotFoundPage: React.FC = () => {
  return (
    <Message warning attached='bottom'>
      <Icon name='warning' />
      <div>Page not found</div>
    </Message>
  );
};

export default NotFoundPage;
