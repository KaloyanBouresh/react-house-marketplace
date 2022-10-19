import { Navigate, Outlet } from 'react-router-dom'

const PrivateRoute = () => {
    const loggedin = false;


    return loggedin ? <Outlet /> : <Navigate to='/sign-in' />
}

export default PrivateRoute