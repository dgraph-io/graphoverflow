import React from "react";
import { Route, Redirect } from "react-router-dom";

// LoggedInRoute returns a <Route /> that either renders the desired component
// if logged in, or redirects to a login page if not logged in
export default function LoggedInRoute({
  component: Component,
  authenticated,
  ...rest
}) {
  return (
    <Route
      {...rest}
      render={props => {
        if (authenticated) {
          return <Component {...props} />;
        }

        return (
          <Redirect
            to={{ pathname: "/login", state: { from: props.location } }}
          />
        );
      }}
    />
  );
}
