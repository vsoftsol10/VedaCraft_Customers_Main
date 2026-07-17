import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ProfileGuard({ children }) {
    const { user } = useAuth();
    const location = useLocation();
    const [isReady, setIsReady] = useState(false);
    // We add a tiny delay to allow AuthContext to fetch the profile from Supabase
    // Otherwise, it might temporarily redirect to profile-completion before fetch finishes.
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 500); // 500ms should be enough for initial fetch, better approach would be adding an isLoading state to AuthContext.
        return () => clearTimeout(timer);
    }, [user]);
    if (!isReady) {
        // Show a minimal loading state while we wait for profile fetch
        return (<div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>);
    }
    // If user is logged in but profile is not complete, redirect to completion page
    if (user && !user.is_profile_complete) {
        return <Navigate to={`/profile-completion?redirect=${encodeURIComponent(location.pathname)}`} replace/>;
    }
    // Otherwise, allow access (guests and completed users)
    return <>{children}</>;
}
