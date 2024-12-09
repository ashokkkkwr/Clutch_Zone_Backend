import {AuthenticationError,AuthorizationError} from '../utils/customAuthenticationError'
export const authenticateUser=(context:any):string=>{
    if(!context.user){
        throw new AuthenticationError();
    }
    if(!context.user.userId){
        throw new AuthenticationError();
    }
    return context.user.userId
}