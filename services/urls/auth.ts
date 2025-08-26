const AUTH_URL = '/api/auth';
const LOGIN_URL = `${AUTH_URL}/login`;
const LOGOUT_URL = `${AUTH_URL}/logout`;
const REGISTER_URL = `${AUTH_URL}/register`;

export {
  AUTH_URL,
  LOGIN_URL,
  LOGOUT_URL,
  REGISTER_URL
};


const login = (username: string, password: string) => {
    return fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
};


const logout = () => {
    return fetch(LOGOUT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
};


const register = (username: string, password: string, email: string) => {
    return fetch(REGISTER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, email })
    });
};
