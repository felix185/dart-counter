function init() {
  getAge();
}

function getAge() {
  var today = new Date();
    var birthDate = new Date("1996/05/18");
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    document.getElementById('age').innerText = age;
}
