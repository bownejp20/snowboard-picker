const bttns = document.getElementsByClassName("bttn");
console.log(bttns, typeof bttns)




Array.from(bttns).forEach(function(singleBttn) {
  console.log(singleBttn.value)
  singleBttn.addEventListener('click', function(){
    window.location = `snowboards?level=${singleBttn.value}` //takes you to a new browser page instead of fetching. 
  });
});


// Array.from(trash).forEach(function(element) {
//       element.addEventListener('click', function(){
//         const name = this.parentNode.parentNode.childNodes[1].innerText
//         const msg = this.parentNode.parentNode.childNodes[3].innerText
//         fetch('messages', {
//           method: 'delete',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             name,
//             msg
//           })
//         }).then(function (response) {
//           window.location.reload()
//         })
//       });
// });
