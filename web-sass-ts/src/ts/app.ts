interface Person {
    firstname: string;
    lastname: string;
}

function greeter(person : Person) {
    return 'Hello, ' + person.firstname + ' ' + person.lastname;
}

var user = {firstname: 'Jane', lastname: 'User'};

var divElem = document.createElement('div');
divElem.innerHTML = greeter(user);
document.body.appendChild(divElem);