document.addEventListener('DOMContentLoaded', () => {

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;

    if (loggedInUser) {

        console.log(loggedInUser);
        const greetUser = document.querySelector('.welcome-msg');
        greetUser.textContent = `Welcome, ${loggedInUser.firstName}!`;

        const transactions = loggedInUser.transactions || [];

        console.log(loggedInUser.transactions);

        transactions.forEach(transaction => {
            addTransactionToHistory(transaction.type, transaction.description, transaction.category, transaction.amount);
        });

        updateSummaryFromTransactions(transactions);
    } else {
        window.location.href = 'https://enz048.github.io/Expense-Tracker/login.html';
    }
});

function addTransactionToHistory(type, description, category, amount) {
    const categoryIcons = {
        Income: './assets/icons8-income-48.png',
        Groceries: './assets/icons8-grocery-48.png',
        Rent: './assets/icons8-rent-48.png',
        Utilities: './assets/icons8-utilities-48.png',
        Transportation: './assets/icons8-transportation-48.png',
        Entertainment: './assets/icons8-entertainment-48.png',
        Other: './assets/icons8-other-48.png',
    };

    const categoryIcon = categoryIcons[category] || './assets/icons8-other-48.png';

    const transactionRow = `
        <tr class="${type.toLowerCase()}">
            <td>${type}</td>
            <td>${description}</td>
            <td class="category-td">
                <img src="${categoryIcon}" alt="${category}" width="30px">${category}
            </td>
            <td>₹ ${amount.toFixed(2)}</td>
            <td><img src="./assets/icons8-delete-50.png" alt="Delete" width="30px" class="delete-btn"></td>
        </tr>
    `;
    document.getElementById('expenseList').insertAdjacentHTML('beforeend', transactionRow);
}


function updateSummaryFromTransactions(transactions) {
    const totalExpensesElem = document.getElementById('totalExpenses');
    const totalIncomeElem = document.getElementById('totalIncome');
    const totalBalanceElem = document.getElementById('totalBalance');

    let totalExpenses = 0;
    let totalIncome = 0;

    transactions.forEach((transaction) => {
        if (transaction.type === 'expense') {
            totalExpenses += transaction.amount;
        } else if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        }
    });

    const balance = totalIncome - totalExpenses;

    totalExpensesElem.textContent = `₹ ${totalExpenses.toFixed(2)}`;
    totalIncomeElem.textContent = `₹ ${totalIncome.toFixed(2)}`;
    totalBalanceElem.textContent = `₹ ${balance.toFixed(2)}`;
}

document.getElementById('addTransaction').addEventListener('click', (e) => {
    e.preventDefault();

    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.querySelector('.dropdownButton').textContent.trim();

    console.log(category);

    if (!description || isNaN(amount) || category === 'Select Category') {
        alert('Please fill out all fields and select a category.');
        return;
    }

    const transaction = { type, description, category, amount };

    addTransactionToHistory(type, description, category, amount);

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        loggedInUser.transactions = loggedInUser.transactions || [];
        loggedInUser.transactions.push(transaction);

        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

        updateSummaryFromTransactions(loggedInUser.transactions);

        console.log(loggedInUser);
    }

    updateCharts(loggedInUser.transactions);
    
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.querySelector('.dropdownButton').textContent = 'Select Category';
});

document.getElementById('expenseList').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const row = e.target.closest('tr');
        const description = row.querySelector('td:nth-child(2)').textContent;
        
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser) {
            loggedInUser.transactions = loggedInUser.transactions.filter(transaction => transaction.description !== description);

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(user => user.email === loggedInUser.email);
            if (userIndex !== -1) {
                users[userIndex] = loggedInUser;
                localStorage.setItem('users', JSON.stringify(users));
            }

            localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

            updateSummaryFromTransactions(loggedInUser.transactions);

            updateCharts(loggedInUser.transactions);

            row.remove();
        }
    }
});

const logOutBtn = document.querySelector('.log-out');

logOutBtn.addEventListener('click', () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => user.email === loggedInUser.email);
        if (userIndex !== -1) {
            users[userIndex] = loggedInUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
    localStorage.removeItem('loggedInUser');
    window.location.href = 'https://enz048.github.io/Expense-Tracker/login.html';
});

function initializeDropdowns() {
    const dropdownButtons = document.querySelectorAll('.dropdownButton');
    const dropdownMenus = document.querySelectorAll('.dropdownMenu');
    const categoryInputs = document.querySelectorAll('.category');

    function closeAllDropdowns() {
        dropdownMenus.forEach((menu) => {
            menu.style.display = 'none';
        });
    }

    dropdownButtons.forEach((button, index) => {
        const menu = dropdownMenus[index];
        const categoryInput = categoryInputs[index];

        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const isVisible = menu.style.display === 'block';
            closeAllDropdowns();
            menu.style.display = isVisible ? 'none' : 'block';
        });

        menu.addEventListener('click', (event) => {
            event.stopPropagation();
            const selectedItem = event.target.closest('li');
            if (selectedItem) {
                const value = selectedItem.getAttribute('data-value');
                const text = selectedItem.textContent.trim();

                button.textContent = text;
                categoryInput.value = value;
                menu.style.display = 'none';
            }
        });
    });

    document.addEventListener('click', () => {
        closeAllDropdowns();
    });
}

initializeDropdowns();

let pieChartInstance;
let lineChartInstance;

document.addEventListener('DOMContentLoaded', () => {
    const pieChartCanvas = document.getElementById('pieChart').getContext('2d');
    const lineChartCanvas = document.getElementById('lineChart').getContext('2d');

    pieChartInstance = new Chart(pieChartCanvas, {
        type: 'pie',
        data: {
            labels: ['No Expenses'],
            datasets: [{
                label: 'Expenses by Category',
                data: [1],
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                ],
            }],
        },
        options: {
            responsive: true,
        },
    });

    lineChartInstance = new Chart(lineChartCanvas, {
        type: 'line',
        data: {
            labels: ['No Transactions'],
            datasets: [
                {
                    label: 'Expenses',
                    data: [0],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                },
                {
                    label: 'Income',
                    data: [0],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                },
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
});

function updateCharts(transactions) {
    const categoryTotals = {};
    transactions.forEach((transaction) => {
        if (transaction.type === "expense") {
            categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
        }
    });

    const pieLabels = Object.keys(categoryTotals);
    const pieData = Object.values(categoryTotals);

    pieChartInstance.data.labels = pieLabels.length > 0 ? pieLabels : ["No Expenses"];
    pieChartInstance.data.datasets[0].data = pieData.length > 0 ? pieData : [1];
    pieChartInstance.update();

    const expenseData = [];
    const incomeData = [];
    const labels = [];

    transactions.forEach((transaction, index) => {
        labels.push(`Transaction ${index + 1}`);
        if (transaction.type === "expense") {
            expenseData.push(transaction.amount);
            incomeData.push(0);
        } else if (transaction.type === "income") {
            incomeData.push(transaction.amount);
            expenseData.push(0);
        }
    });

    lineChartInstance.data.labels = labels.length > 0 ? labels : ["No Transactions"];
    lineChartInstance.data.datasets[0].data = expenseData.length > 0 ? expenseData : [0];
    lineChartInstance.data.datasets[1].data = incomeData.length > 0 ? incomeData : [0];
    lineChartInstance.update();
}

document.addEventListener("DOMContentLoaded", () => {
    const getStartedBtn = document.querySelector('.chatbotBtn');
    const chatModal = document.getElementById('chatModal');
    const closeChatBtn = document.getElementById('closeChat');
    const sendMessageBtn = document.getElementById('sendMessage');
    const userMessageInput = document.getElementById('userMessage');
    const chatMessagesDiv = document.getElementById('chatMessages');
    const chatOverlay = document.querySelector('.chat-overlay');

    getStartedBtn.addEventListener('click', () => {
        chatModal.classList.remove('hidden');
        chatOverlay.classList.add('active');
    });

    closeChatBtn.addEventListener('click', () => {
        chatModal.classList.add('hidden');
        chatOverlay.classList.remove('active');
    });

    sendMessageBtn.addEventListener('click', async () => {
        const userMessage = userMessageInput.value.trim();
        if (!userMessage) return;

        appendMessage('You', userMessage, 'user');

        userMessageInput.value = '';

        const response = await fetchGeminiResponse(userMessage); 
        appendMessage('Marco', response, 'bot');
    });

    function appendMessage(sender, message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatMessagesDiv.appendChild(messageElement);
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }

    async function fetchGeminiResponse(userMessage) {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;
        const prompt = `
You are Marco, a friendly financial assistant in the SpendSense. Personalize your responses with the user's name and refer to yourself as Marco. Keep the tone professional, friendly, and slightly humorous. Here's how you should respond:
- User: "How can I save more money?"
  Marco: "Hi, John! This is Marco. Saving money is all about planning. Start by cutting out unnecessary expenses, like subscriptions you don't use. And remember, saving is like planting seeds for your financial garden!"
- User: "What's a budget?"
  Marco: "Hey, John! Marco here. A budget is a plan for how you'll spend your money. It's like a roadmap to your financial success. Let's create one together!"
  
Now answer the following user query: ${userMessage}.
Users name is ${loggedInUser.firstName}
`;

        const APIKEY = 'AIzaSyBptXu7u5CJl41rrAko64Ire4ZVjsAu3FA';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${APIKEY}`;
        const payload = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ]
        };

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log(data);

            if (data) {
                const reply = data.candidates[0].content.parts[0].text.trim();
                return marked.parse(reply);
            } else {
                return "Oops! I couldn't process that. Try asking me something else!";
            }
        } catch (error) {
            console.error("Error fetching response from Gemini API:", error);
            return "Sorry, there was an error connecting to the financial advisor. Please try again later.";
        }
    }
});

document.querySelector('.check-tax-btn').addEventListener('click', () => {
    document.querySelector(".taxoverlay").style.display = "block";
    document.getElementById("taxModal").style.display = "block";
    const incomeRes = document.querySelector('.total-income');
    const taxResult = document.querySelector('#taxResult');

    let totalIncome = 0;

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;

    if (loggedInUser) {
        const transactions = loggedInUser.transactions || [];

        transactions.forEach((transaction) => {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            }
        });
    }

    incomeRes.textContent = `Total Income : ${totalIncome}`;

    let tax = 0;
    if (totalIncome > 1500000) tax = (totalIncome - 1500000) * 0.3 + 300000 * 0.2 + 300000 * 0.15 + 300000 * 0.1 + 300000 * 0.05;
    else if (totalIncome > 1200000) tax = (totalIncome - 1200000) * 0.2 + 300000 * 0.15 + 300000 * 0.1 + 300000 * 0.05;
    else if (totalIncome > 900000) tax = (totalIncome - 900000) * 0.15 + 300000 * 0.1 + 300000 * 0.05;
    else if (totalIncome > 600000) tax = (totalIncome - 600000) * 0.1 + 300000 * 0.05;
    else if (totalIncome > 500000) tax = (totalIncome - 500000) * 0.05;
    else if (totalIncome > 300000) tax = (totalIncome - 300000) * 0.05;



    taxResult.textContent = `Tax Amount = ${tax}`;

    document.getElementById("payBtn").addEventListener("click", function () {
        var options = {
            key: "rzp_test_H4lkIntkGdsyi4",
            amount: tax,
            currency: "INR",
            name: "Tax Payment",
            description: "Demo Tax Payment",
            image: "https://yourwebsite.com/logo.png",
            handler: function (response) {
                alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            },
            prefill: {
                name: `${loggedInUser.firstName}`,
                email: `${loggedInUser.email}`,
                contact: "9876543210"
            },
            theme: {
                color: "#007bff"
            }
        };

        var rzp = new Razorpay(options);
        rzp.open();
    });
});

document.getElementById("closeModal").addEventListener("click", function () {
    document.querySelector(".taxoverlay").style.display = "none";
    document.getElementById("taxModal").style.display = "none";
});