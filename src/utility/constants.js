export const VITE_GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
export const API_HOST = import.meta.env.VITE_API_HOST;

if(!API_HOST){
    throw new Error(`ENV VARIABlES ARE NOT INITIALIZED CORRECTLY ${VITE_GOOGLE_API_KEY}  and ${API_HOST}`)
}

