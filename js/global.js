const saveUser = (firstName, lastName, email, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    users.push({ firstName, lastName, email, password, transactions: [] });
    localStorage.setItem('users', JSON.stringify(users));
};

const findUser = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(user => user.email === email && user.password === password);
};

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            console.log('loginBtn clicked');
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                alert('Please fill out all fields');
                return;
            }

            const user = findUser(email, password);

            if (user) {
                alert('login successful');
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                window.location.href = 'https://enz048.github.io/Expense-Tracker/';
            } else {
                alert('Invalid email or password');
            }
        });
    }

    const registerBtn = document.getElementById('registerBtn');

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!firstName || !lastName || !email || !password || !confirmPassword) {
                alert('Please fill out all fields');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            saveUser(firstName, lastName, email, password);
            alert('Registration successful!');

            document.getElementById('firstName').value = '';
            document.getElementById('lastName').value = '';
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            document.getElementById('confirmPassword').value = '';

            window.location.href = 'https://enz048.github.io/Expense-Tracker/login.html';
        });
    }

    const signUpPageBtn = document.getElementById('signUpPageBtn');

    if (signUpPageBtn) {
        signUpPageBtn.addEventListener('click', () => {
            console.log('signUpPageBtn clicked');
            window.location.href = 'https://enz048.github.io/Expense-Tracker/register.html';
        });
    }

    const loginPageBtn = document.getElementById('loginPageBtn');

    if (loginPageBtn) {
        loginPageBtn.addEventListener('click', () => {
            console.log('loginPageBtn clicked');
            window.location.href = 'https://enz048.github.io/Expense-Tracker/login.html';
        });
    }
});
