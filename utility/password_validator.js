const PASSWORD_REGEX = /^(\!*\@*\#*\?*\_*[a-zA-Z0-9]*)+$/;

export const validatePassword = password => {

    if(password === ''){
        
        return -1;
    }
    else if(password.length <= 8 && password.length > 100){
        return false;
    }
    else if(!PASSWORD_REGEX.test(password)){

        return false;
    }
    else{
        return true;
    }
}