function forLoop() {
    console.log("--Forloop--")
    for (let i = 1; i <= 10; i++) { 
        console.log(i);
    }
}

function evenOdd() {
    console.log("-- Checking even or odd nomber --")
    let number = parseInt(prompt("[+] Input number:"));
    if (number % 2 === 0) {
        console.log(number + " adalah angka genap");
    } else {
        console.log(number + " adalah angka ganjil");
    }
}

function calculatorAddition() {
    console.log("-- calculactor Addition --")
    let no1 = parseInt(prompt("[+] Input first number:"));
    let no2 = parseInt(prompt("[+] Input second number:"));
    let addition = no1 + no2;

    console.log(`${no1} + ${no2} = ${addition}`);
}

function gradeChecker() {
    console.log("--- Checking grade score ---")
    let score = parseInt(prompt("[+] Input your score:"));
    console.log(`Your score = ${score}`);

    if (score >= 90 ) {
        console.log("Grade : A");
    } else if (score >= 80 && score <= 89) {
        console.log("Grade : B");
    } else if (score >= 70 && score <= 79) {
        console.log("Grade : C");
    } else {
        console.log("Fail");
    }
}

function multiplicationLoop() {
    console.log("--- Multiplication Loop ---")
    let a = parseInt(prompt("[+] Input number for multiplication:"));
    for (let b = 1; b <= 10; b++) {
        console.log(`${a} x ${b} = ${a * b}`);
    }
}
function arrayFruits(){
    console.log("--- array of fruits ---");
    const fruits = ["Apple", "Orange", "Mango", "Banana", "Grape"];
    for (const fruit of fruits){
        console.log(fruit)
    }
}

function largestNumber(){
    console.log("--- largest numbers ---")
    const numbers = [12, 5, 20, 25, 7];
    let largest = numbers[0];

    for (let i = 1; i < numbers.length; i ++){
        if (numbers[i] > largest){
            largest = numbers[i];
        }
    }

    console.log("The largest nomber in array is:" + largest)

}

function reverseString() {
    console.log("--- reverse strings ---")
    let word = prompt("Masukkan sebuah kata:");
    let reversedWord = word.split('').reverse().join('');
    console.log("Hasil setelah dibalik:" + reversedWord);
}


function primeChecker(){
console.log("--- Prime checker ---")
let num = parseInt(prompt("Masukkan angka untuk dicek (prima atau bukan):"));
let isPrime = true;

if (num <= 1) {
  isPrime = false;
} else {
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      isPrime = false;
      break;
    }
  }
}

if (isPrime) {
  console.log(num + " adalah bilangan prima.");
} else {
  console.log(num + " bukan bilangan prima.");
}
}

function filteringAdults(){
console.log("--- filtering adults ---")
const ages = [12, 18, 25, 30, 15];
const adults = ages.filter(age => age >= 18);

console.log("Usia dewasa (18 tahun ke atas):", adults);
}
 