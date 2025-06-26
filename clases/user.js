let userId = 1;

class User {
    constructor(userName, email, password) {
        this.id = userId++;
        this.userName = userName;
        this.email = email;
        this.password = password;
    }
}

const users = [
    new User("Vitina", "a", "a")
];
