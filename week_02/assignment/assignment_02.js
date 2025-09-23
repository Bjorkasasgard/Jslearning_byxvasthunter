// 1. SWAP THE VALUES
let x, y, z;
x = 10;
y = 20;

z = x;
x = y;
y = z;

console.log('=== swapping values ===')
console.log(`x = ${x} 
            y = ${y}`);
            
//  2. SIMPLE MATH WITH VARIABLE
let a = 8;
let b = 3;

let sum = a + b;
let product = a * b;
let averege = (a + b) / 2;

console.log('=== simple math with variable ===')
console.log(`
    a = ${a}
    b = ${b}
    `)
console.log(`
    the result a + b = ${sum}
    the result a * b = ${product} 
    the result (a + b) / 2 = ${averege}
    `)

// 3. TEMPERATURE CONVERTION temperature conversion
let c, r, f, k; 

c = 25;
r = 4/5 * c; 
f = 9/5 * c + 32;
k = c + 273.15;

console.log('=== Temperature conversion ===')
console.log(`
    Celcius = ${c}C
    Celcius to Reamur = ${r}R
    Celcius to Fahrenheit = ${f}F
    Celcius to Kelvin = ${k}K
    `)

// 4. PRECEDENCE OF VALUE 

// Before looking at the program output, let’s think for a moment.
// In operator precedence, multiplication comes first before addition.
// This program has 2 variables: a and b. Variable a has the value 5 and b has the value 2.
// The variable result operates a + b * a which means 5 + 2 x 5 = 15. Why?
// Because in operator precedence, multiplication is done before addition.
// This means 5 + 2 x 5 = 5 + 10 = 15. let see :D

let A = 5; // Variable A have value, the value is 5 (integer)
let B = 2; // Variable B have value, the value is 2 (integer too)
let result = A + B * A; // reminder the operator precedence multiplication is done before addition.
// its means 5 + 2 x 5 = 15

console.log('=== Predance of value ===')
console.log(`Result = ${result}`) // so, the output is 15

// 5. COMBINE STRINGS

// Here, I created two variables (fullName and $fullName) for comparison 
// between combining with space and without space.

let firstName = 'John';
let lastName = 'Doe';
let fullName = firstName + ' ' + lastName; // with sapace. (' ') > its strings!
let $fullName = firstName + lastName; // without space. no strings ' ' is added, so the names join directly

console.log(`Result with space: ${fullName}`) ; // the result is 'Jhon Doe'
console.log(`Result with no space: ${$fullName}`); // the result is 'JohnDoe'.
//  why? | bcz at variable $fullName dosent attached strings like '' for give a space

// 6. GUESS THE OUTPUT
let X = 10; // the value 10 (integer) is stored in variable X
let Y = X;  // the value of Y is the value of X, at this line X is 10
X = 20;     // X = 20

console.log('=== Guess the output ===')
console.log(Y); // the result is 10. Why?
// When the value of X is changed to 20, Y does not change.
// Y only stores the old copy of X (not a connected reference).
// In JavaScript, primitive data types are copied by value.
