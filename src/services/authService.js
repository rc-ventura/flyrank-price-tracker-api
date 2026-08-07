import supabase from '../../db/supabase.client.js';
import { ValidationError, AuthenticationError } from '../error.js';



const signup = async (body = {}) => {
    const { email, password } = body;

    if (email === undefined || email === null || String(email).trim() === '') {
        throw new ValidationError("Email is required");
    }
    if (password === undefined || password === null || String(password).trim() === '') {
        throw new ValidationError("Password is required");
    }

    const {data, error} = await supabase.auth.signUp({
            email: String(email).trim(),
            password: String(password).trim()
        });
        
    if (error) {
        throw new ValidationError(error.message);
    }
    
    return data.user;
}

const login = async (body = {}) => {
    const { email, password } = body;

    if (email === undefined || email === null || String(email).trim() === '') {
        throw new ValidationError("Email is required");
    }
    if (password === undefined || password === null || String(password).trim() === '') {
        throw new ValidationError("Password is required");
    }

    const {data, error} = await supabase.auth.signInWithPassword({
            email: String(email).trim(),
            password: String(password).trim()
        });
        
    if (error) {
        throw new AuthenticationError('Invalid login credentials');
    }
    
    return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token
    }
}


const logout = async () => {
    
   
    const { error } = await supabase.auth.signOut({
        scope: 'local' // or 'all' to sign out from all devices
    });
    
    if (error) {
        throw new AuthenticationError('Logout failed');
    }
    
}

const refresh = async (body = {}) => {
    const { refreshToken } = body;

    if (refreshToken === undefined || refreshToken === null || String(refreshToken).trim() === '') {
        throw new ValidationError("Refresh token is required");
    }
    
    const { data, error } = await supabase.auth.refreshSession({
        refresh_token: String(refreshToken).trim()
    });
    if (error) {
        throw new AuthenticationError('Invalid or expired refresh token');
    }
    return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token
    };
}


const verifyToken = async (token) => {
    const { data: {user}, error } = await supabase.auth.getUser(token);
    if (error) {
        throw new AuthenticationError('Invalid or expired token');
    }

    const {id, email, created_at} = user;
    return {id, email, created_at};
}


export default {
    signup,
    login,
    logout,
    refresh,
    verifyToken
};

