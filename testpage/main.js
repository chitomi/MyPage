/*
fetch("test.txt")
  .then((data) => data.text())
  .then((res) => console.log(res));

async function fetchData(){
    const data = await fetch("test.txt");
    const res = await data.text();
    console.log(res);
}
fetchData();
*/

// console.log("こんにちは");

fetch("data.json")
  .then((data) => data.json())
  .then((res) => console.log(res));
