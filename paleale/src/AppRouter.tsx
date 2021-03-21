import React from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";

import AuthGuard from "./AuthGuard";
import Auth0Callback from "./components/callback/Auth0Callback";

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/callback" component={Auth0Callback}/>
        <Route path="/" component={AuthGuard}/>
      </Switch>
    </Router>
  );
};

export default AppRouter;
