import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Room from './pages/Room';
import Main from './pages/Main';
import NotFound404 from './pages/NotFoundPage';

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/room/:id' component={Room} />
        <Route exact path='/' component={Main} />
        <Route component={NotFound404} />
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;
