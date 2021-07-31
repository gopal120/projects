'use strict';

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2,
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displaymovements = function (movement) {
  containerMovements.innerHTML = '';
  movement.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i} deposit</div>
    <div class="movements__value">${mov}€</div>
  </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
let balance;
const calcdisplaybalance = function (movement) {
  balance = movement.reduce(function (mov, curr) {
    return mov + curr;
  }, 0);
  labelBalance.textContent = `${balance}€`;
};

const displaysummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((mov, arr) => mov + arr, 0);
  labelSumIn.textContent = `${incomes}€`;

  const expense = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, arr) => acc + arr, 0);

  labelSumOut.textContent = `${Math.abs(expense)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * acc.interestRate) / 100)
    .filter(mov => mov >= 1)
    .reduce((acc, arr) => acc + arr, 0);
  labelSumInterest.textContent = `${interest}€`;
};

const createusername = function (acc) {
  acc.forEach(function (account) {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(function (firstletter) {
        return firstletter[0];
      })
      .join('');
  });
};
createusername(accounts);
console.log(accounts);

let currentaccount;
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  console.log('login');
  currentaccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentaccount.pin === Number(inputLoginPin.value)) {
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `welcome  ${currentaccount.owner.split(' ')[0]}`;
    displaymovements(currentaccount.movements);
    calcdisplaybalance(currentaccount.movements);
    displaysummary(currentaccount);
    inputLoginUsername.value = inputLoginPin.value = ``;
    inputLoginPin.blur();
  }
});
let a;
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  a = accounts.find(mov => mov.username === inputTransferTo.value);
  if (
    inputTransferAmount.value > 0 &&
    inputTransferAmount.value <= balance &&
    a.username !== currentaccount.username
  ) {
    console.log('transered');
    console.log(a);
    a.movements.push(Number(inputTransferAmount.value));
    currentaccount.movements.push(-inputTransferAmount.value);
    console.log(a);
    console.log(currentaccount);
    displaymovements(currentaccount.movements);
    calcdisplaybalance(currentaccount.movements);
    displaysummary(currentaccount);
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentaccount.username &&
    Number(inputClosePin.value) === currentaccount.pin
  ) {
    const index = accounts.findIndex(
      mov => currentaccount.username === mov.username
    );
    console.log(index);
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});
