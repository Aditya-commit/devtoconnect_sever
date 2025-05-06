const NAME_REGEX = /^(_*[a-zA-Z0-9]*_*\s*)+$/


export const validateName = name => {

    if(name === ''){
        
        return -1;
    }
    else if(name.length < 3 || name.length > 40){
        return false;
    }
    else if(!NAME_REGEX.test(name)){

        return false;
    }
    else{
        return true;
    }
}