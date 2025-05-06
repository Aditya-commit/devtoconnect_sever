const USERNAME_REGEX = /^(\_*[a-zA-Z0-9]\_*)+$/;

export const validateUsername = username => {

    if(username === ''){
        
        return -1;
    }
    else if(username.length < 3 || username.length > 40){
        return false;
    }
    else if(!USERNAME_REGEX.test(username)){

        return false;
    }
    else{
        return true;
    }
}