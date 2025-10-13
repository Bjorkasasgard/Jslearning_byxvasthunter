let student = {
    name :"Putry",
    birthDay : "08 August 2006",
    hobby : "listening music",
    address : "jumpunk",
}

// console.log(studentInfo);
// console.log(studentInfo.name); // call the property on object

// console.log("=== adding property ===") // adding new property
// studentInfo.isMarried = true;
// studentInfo.gender = "Man";
// console.log(studentInfo);

// console.log("=== More Information ===") // more info
// studentInfo["Alternative Address"] = "Jl. Cibolang kaler"

// delete studentInfo.birthDay; // delete property
// console.log(studentInfo);


// //check if the property exixt 
// if ("Alternative Address" in studentInfo) {
//     console.log(studentInfo["Alternative Address"]);
// } 

// if (studentInfo.hasOwnProperty("Alternative Address")) {
//     console.log("Properti 'Alternative Address' ditemukan!");
// }

const putri = student;
putri.name = "Putri Aulia";

console.log(student == putri);
console.log(student.name)

const bayu = Object.assign({},student); // cloning 
bayu.name = "Bayu Indra Permana"

console.log(bayu)

// alias, deep copy (PR)