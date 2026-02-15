import { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// We gather the path and any other props using ...rest
const PrivateRoute = ({ children, ...rest }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  // If user exists, render the children. If not, Redirect to login.
  return (
    <Route
      {...rest}
      render={() => (user ? children : <Redirect to="/login" />)}
    />
  );
};

export default PrivateRoute;