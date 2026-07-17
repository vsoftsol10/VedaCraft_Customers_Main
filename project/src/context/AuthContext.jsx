import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('vc_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [session, setSession] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(() => {
        const saved = localStorage.getItem('vc_selected_location');
        if (saved)
            return JSON.parse(saved);
        return { type: 'pincode', value: '', text: 'Detecting...' };
    });
    const hasAutoDetected = useRef(false);
    // ─── Fetch addresses directly from Supabase ───────────────────────────────
    const fetchAddresses = useCallback(async () => {
        try {
            const { data: { user: sessionUser } } = await supabase.auth.getUser();
            if (!sessionUser)
                return;
            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', sessionUser.id)
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Error fetching addresses:', error.message);
                return;
            }
            if (data) {
                setAddresses(data.map((a) => ({
                    id: a.id,
                    fullName: a.full_name,
                    phoneNumber: a.phone_number,
                    address: a.address,
                    city: a.city,
                    state: a.state,
                    pincode: a.pincode,
                    landmark: a.landmark || '',
                    addressType: a.address_type,
                    is_default: a.is_default,
                })));
            }
        }
        catch (err) {
            console.error('fetchAddresses error:', err);
        }
    }, []);
    const fetchProfile = async (sessionUser) => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', sessionUser.id)
                .single();
            if (data) {
               const fullUser = {
    id: sessionUser.id,
    name: data.full_name || sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User',
    email: sessionUser.email || '',
    phone_number: data.phone_number || '',
    gender: data.gender || '',
    dob: data.dob || '',
    avatar_url: data.avatar_url || '',

    // Size Profile
    top_size: data.top_size || "M",
    bottom_size: data.bottom_size || "32",
    measurement_unit: data.measurement_unit || "in",
    shoulder: data.shoulder || "",
    chest: data.chest || "",
    waist: data.waist || "",
    hips: data.hips || "",

    is_profile_complete: data.is_profile_complete || false,
};
                setUser(fullUser);
                localStorage.setItem('vc_user', JSON.stringify(fullUser));
            }
            else {
                const partialUser = {
                    id: sessionUser.id,
                    name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User',
                    email: sessionUser.email || '',
                    is_profile_complete: false,
                };
                setUser(partialUser);
                localStorage.setItem('vc_user', JSON.stringify(partialUser));
            }
            await fetchAddresses();
        }
        catch (err) {
            console.error('fetchProfile error:', err);
        }
    };
    const refreshProfile = async () => {
    const {
        data: { user: sessionUser },
    } = await supabase.auth.getUser();

    if (sessionUser) {
        await fetchProfile(sessionUser);
    }
};
    
    // ─── Auto Detect Location on first visit ─────────────────────────────────
    useEffect(() => {
        const alreadySaved = localStorage.getItem('vc_selected_location');
        if (alreadySaved || hasAutoDetected.current)
            return;
        hasAutoDetected.current = true;
        if (!navigator.geolocation) {
            // Fallback default
            const fallback = { type: 'pincode', value: '627002', text: 'Tirunelveli - 627002' };
            setSelectedLocation(fallback);
            localStorage.setItem('vc_selected_location', JSON.stringify(fallback));
            return;
        }
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // OpenStreetMap Nominatim reverse geocoding (free, no API key)
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`, { headers: { 'Accept-Language': 'en' } });
                const data = await res.json();
                const addr = data.address || {};
                const city = addr.city ||
                    addr.town ||
                    addr.village ||
                    addr.county ||
                    addr.state_district ||
                    addr.state ||
                    'India';
                const pincode = addr.postcode || '000000';
                const loc = {
                    type: 'pincode',
                    value: pincode,
                    text: `${city} - ${pincode}`,
                };
                setSelectedLocation(loc);
                localStorage.setItem('vc_selected_location', JSON.stringify(loc));
            }
            catch {
                // Fallback if geocoding fails
                const fallback = { type: 'pincode', value: '627002', text: 'Tirunelveli - 627002' };
                setSelectedLocation(fallback);
                localStorage.setItem('vc_selected_location', JSON.stringify(fallback));
            }
        }, () => {
            // Permission denied or error → fallback
            const fallback = { type: 'pincode', value: '627002', text: 'Tirunelveli - 627002' };
            setSelectedLocation(fallback);
            localStorage.setItem('vc_selected_location', JSON.stringify(fallback));
        }, { timeout: 10000, enableHighAccuracy: false });
    }, []);
    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.access_token) {
                const { data: userData, error } = await supabase.auth.getUser(session.access_token);
                if (error || !userData?.user) {
                    await supabase.auth.signOut();
                    setSession(null);
                    setUser(null);
                    localStorage.removeItem('vc_user');
                    setAddresses([]);
                    setAuthReady(true);
                    return;
                }
                setSession(session);
                void fetchProfile(userData.user);
            }
            else {
                setSession(null);
                setUser(null);
                localStorage.removeItem('vc_user');
                setAddresses([]);
            }
            setAuthReady(true);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setAuthReady(true);
            if (session?.user) {
                void fetchProfile(session.user);
            }
            else {
                setUser(null);
                localStorage.removeItem('vc_user');
                setAddresses([]);
            }
        });
        return () => subscription.unsubscribe();
    }, [fetchAddresses]);
    const login = (email, name) => {
        const defaultName = name || email.split('@')[0];
        const newUser = {
            id: `mock-${Date.now()}`,
            name: defaultName,
            email,
            is_profile_complete: false,
        };
        setUser(newUser);
        localStorage.setItem('vc_user', JSON.stringify(newUser));
    };
    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setSession(null);
        setAuthReady(true);
        setUser(null);
        localStorage.removeItem('vc_user');
        setAddresses([]);
    }, []);
    // ─── Add Address ──────────────────────────────────────────────────────────
    const addAddress = async (newAddr) => {
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        if (!sessionUser)
            throw new Error('Not authenticated');
        // Count existing addresses to decide if this should be default
        const { count } = await supabase
            .from('addresses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', sessionUser.id);
        const makeDefault = count === 0 || newAddr.is_default;
        // Unset existing default if needed
        if (makeDefault) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', sessionUser.id)
                .eq('is_default', true);
        }
        const { data, error } = await supabase
            .from('addresses')
            .insert([{
                user_id: sessionUser.id,
                full_name: newAddr.fullName,
                phone_number: newAddr.phoneNumber,
                address: newAddr.address,
                city: newAddr.city,
                state: newAddr.state,
                pincode: newAddr.pincode,
                landmark: newAddr.landmark,
                address_type: newAddr.addressType,
                is_default: makeDefault,
            }])
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        await fetchAddresses();
        return {
            id: data.id,
            fullName: data.full_name,
            phoneNumber: data.phone_number,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            landmark: data.landmark || '',
            addressType: data.address_type,
            is_default: data.is_default,
        };
    };
    // ─── Update Address ───────────────────────────────────────────────────────
    const updateAddress = async (updated) => {
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        if (!sessionUser)
            throw new Error('Not authenticated');
        if (updated.is_default) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', sessionUser.id)
                .eq('is_default', true);
        }
        const { error } = await supabase
            .from('addresses')
            .update({
            full_name: updated.fullName,
            phone_number: updated.phoneNumber,
            address: updated.address,
            city: updated.city,
            state: updated.state,
            pincode: updated.pincode,
            landmark: updated.landmark,
            address_type: updated.addressType,
            is_default: updated.is_default,
            updated_at: new Date().toISOString(),
        })
            .eq('id', updated.id)
            .eq('user_id', sessionUser.id);
        if (error)
            throw new Error(error.message);
        await fetchAddresses();
        if (selectedLocation.type === 'address' && selectedLocation.value === updated.id) {
            updateLocation({
                type: 'address',
                value: updated.id,
                text: `${updated.city} - ${updated.pincode}`,
            });
        }
    };
    // ─── Delete Address ───────────────────────────────────────────────────────
    const deleteAddress = async (id) => {
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        if (!sessionUser)
            throw new Error('Not authenticated');
        const { data: addr } = await supabase
            .from('addresses')
            .select('is_default')
            .eq('id', id)
            .eq('user_id', sessionUser.id)
            .single();
        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id)
            .eq('user_id', sessionUser.id);
        if (error)
            throw new Error(error.message);
        // If deleted was default, promote the next one
        if (addr?.is_default) {
            const { data: next } = await supabase
                .from('addresses')
                .select('id')
                .eq('user_id', sessionUser.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            if (next) {
                await supabase
                    .from('addresses')
                    .update({ is_default: true })
                    .eq('id', next.id);
            }
        }
        await fetchAddresses();
        if (selectedLocation.type === 'address' && selectedLocation.value === id) {
            updateLocation({ type: 'pincode', value: '627002', text: 'Tirunelveli - 627002' });
        }
    };
    // ─── Set Default Address ──────────────────────────────────────────────────
    const setDefaultAddress = async (id) => {
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        if (!sessionUser)
            throw new Error('Not authenticated');
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', sessionUser.id)
            .eq('is_default', true);
        const { error } = await supabase
            .from('addresses')
            .update({ is_default: true })
            .eq('id', id)
            .eq('user_id', sessionUser.id);
        if (error)
            throw new Error(error.message);
        await fetchAddresses();
    };
    const updateLocation = (loc) => {
        setSelectedLocation(loc);
        localStorage.setItem('vc_selected_location', JSON.stringify(loc));
    };
    return (<AuthContext.Provider
  value={{
    user,
    login,
    logout,

    refreshProfile,

    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,

    selectedLocation,
    updateLocation,

    fetchAddresses,

    session,
    accessToken: session?.access_token || null,
    authReady,
  }}
>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
