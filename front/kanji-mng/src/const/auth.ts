const appId = process.env.REACT_APP_KANJI_MNG_APP_ID;
const AUTH_URL = `${process.env.REACT_APP_AUTH_BASE_URL}/auth/login?app_id=${appId}`;

export default AUTH_URL;
