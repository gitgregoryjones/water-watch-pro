export const VITE_GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
export const API_HOST = import.meta.env.VITE_API_HOST;
export const VITE_PRICES_LINK = import.meta.env.VITE_PRICES_LINK;
export const VITE_MAILCHIMP_LOGIN = import.meta.env.VITE_MAILCHIMP_LOGIN;
export const VITE_TWILIO_LOGIN = import.meta.env.VITE_TWILIO_LOGIN
export const VITE_PAYMENT_LINK_GOLD = import.meta.env.VITE_PAYMENT_LINK_GOLD;
export const VITE_STRICT_VALIDATION = import.meta.env.VITE_STRICT_VALIDATION;
export const VITE_PRICE_ID_GOLD = import.meta.env.VITE_PRICE_ID_GOLD;
export const VITE_PRICE_ID_SILVER = import.meta.env.VITE_PRICE_ID_SILVER;
export const VITE_PRICE_ID_BRONZE = import.meta.env.VITE_PRICE_ID_BRONZE;
export const VITE_PRICE_ID_TRIAL = import.meta.env.VITE_PRICE_ID_TRIAL;
export const VITE_STRIPE_SUCCESS_URL = import.meta.env.VITE_STRIPE_SUCCESS_URL;
export const VITE_STRIPE_UPGRADE_SUCCESS_URL = import.meta.env.VITE_STRIPE_UPGRADE_SUCCESS_URL;
export const VITE_STRIPE_CANCEL_URL = import.meta.env.VITE_STRIPE_CANCEL_URL;
export const VITE_FEATURE_EXCEL_REPORT = import.meta.env.VITE_FEATURE_EXCEL_REPORT;
export const VITE_FEATURE_RAPIDRAIN_FIRST = import.meta.env.VITE_FEATURE_RAPIDRAIN_FIRST;
export const VITE_SOCKETLABS_API_KEY=import.meta.env.VITE_SOCKETLABS_API_KEY;
export const VITE_SOCKETLABS_FROM_EMAIL=import.meta.env.VITE_SOCKETLABS_FROM_EMAIL
export const VITE_SOCKETLABS_SERVER_ID=import.meta.env.VITE_SOCKETLABS_SERVER_ID
export const VITE_EMAIL_PROXY=import.meta.env.VITE_EMAIL_PROXY
export const VITE_WATER_WATCH_SUPPORT=import.meta.env.VITE_WATER_WATCH_SUPPORT
export const VITE_FEATURE_MULTIPLE_CLIENTS=import.meta.env.VITE_FEATURE_MULTIPLE_CLIENTS
export const VITE_FEATURE_PDF_REPORT = import.meta.env.VITE_FEATURE_PDF_REPORT
export const VITE_FEATURE_TABLE_VIEW = import.meta.env.VITE_FEATURE_TABLE_VIEW;




if(!API_HOST){
    throw new Error(`ENV VARIABlES ARE NOT INITIALIZED CORRECTLY ${VITE_GOOGLE_API_KEY}  and ${API_HOST}`)
}

