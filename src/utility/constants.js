export const VITE_GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
export const API_HOST = import.meta.env.VITE_API_HOST;
export const VITE_PRICES_LINK = import.meta.env.VITE_PRICES_LINK;
export const VITE_MAILCHIMP_LOGIN = import.meta.env.VITE_MAILCHIMP_LOGIN;
export const VITE_TWILIO_LOGIN = import.meta.env.VITE_TWILIO_LOGIN




if(!API_HOST){
    throw new Error(`ENV VARIABlES ARE NOT INITIALIZED CORRECTLY ${VITE_GOOGLE_API_KEY}  and ${API_HOST}`)
}

