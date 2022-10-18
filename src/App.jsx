import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Explore from './pages/Explore';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import Offers from './pages/Offers';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/sign-in' element={<SignIn />}></Route>
          <Route path='/sign-up' element={<SignUp />}></Route>
          <Route path='/offers' element={<Offers />}></Route>
          <Route path='/profile' element={<SignIn />}></Route>
          <Route path='/forgot-password' element={<ForgotPassword />}></Route>
          <Route path='/' element={<Explore />}></Route>
        </Routes>
        < Navbar />
      </Router>
    </>
  );
}

export default App;
