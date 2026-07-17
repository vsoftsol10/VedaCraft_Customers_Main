import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();
    if (!user) {
        // Redirect to login, passing current path so we can redirect back after login
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace/>;
    }
    return <>{children}</>;
}
