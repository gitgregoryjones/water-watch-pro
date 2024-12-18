import { retry } from "@reduxjs/toolkit/query";

import { VITE_STRICT_VALIDATION } from "./constants";

export default function validatePassword(password,retypePassword){

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d)[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;


// Test cases

    let errors = [];

    if(VITE_STRICT_VALIDATION && VITE_STRICT_VALIDATION == "disabled"){
        return true;
    }

    if(!passwordRegex.test(password)){
        errors.push(`Password must contain at least one capital letter, one digit, one special character and the password must be at least 8 characters long`)
    }

    if(retypePassword){
        if(!passwordRegex.test(retypePassword)){
            errors.push(`The new password must contain at least one capital letter, one digit, one special character and the password must be at least 8 characters long`)
        }
    }

    return errors;

}