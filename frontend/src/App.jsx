import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explorer from './pages/Explorer'; // <-- Import the new page!
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>

          <Route path="/login">
            <Login />
          </Route>

          <Route path="/register">
            <Register />
          </Route>

          <PrivateRoute path="/dashboard">
            <Dashboard />
          </PrivateRoute>

          {/* <-- Add the new secure route here! --> */}
          <PrivateRoute path="/explorer">
            <Explorer />
          </PrivateRoute>

        </Switch>
      </div>
    </Router>
  );
}

export default App;