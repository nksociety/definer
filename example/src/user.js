definer(function () {
    let user;
    
    function quitUser() {
        user = undefined;
    }
    
    function getUser() {
        return user;
    }
    
    function setUser(name) {
        user = name;
    }
    
    return {
        getUser,
        setUser,
        quitUser
    }
})