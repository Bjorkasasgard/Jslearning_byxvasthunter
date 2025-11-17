let value = true;
console.log(typeof value) // boolean (true false)

value = String(value) // String change value to string 
console.log(typeof value)


console.log("8" / "2") // string

let str = "123" // str
console.log(typeof str)

let num = Number(str) // Number change str value to number
console.log(typeof num)

let age = Number("an arbitrary string instead of a number");
console.log(typeof age);


console.log( Boolean(1) ); // true
console.log( Boolean(0) ); // false

console.log( Boolean("hello") ); // true
console.log( Boolean("") ); // false

console.log(Boolean("")); // true 
console.log(Boolean("1")); // true

// undefined = NaN
// null = 0
// true n false = 1 0