const socket = io();

document.querySelector('#button').addEventListener('click', function (event) {
    event.preventDefault();
    try {
        let form = document.forms.form;
        let surname = form.surname.value;
        let name = form.name.value;
        let patronimyc = form.patronymic.value;
        let email = form.email.value;
        let birthdate = form.birthdate.value;
        let passport = form.passport.value;
        let telephone = form.telephone.value;
        let tourCode = document.querySelector("#tour_code_select").value;
        if(!surname || !name || !patronimyc || !birthdate || !passport || !telephone || !tourCode) throw new Error("Пустое поле");
        if(passport.length !== 9) throw new Error("Неверные серия и номер паспорта!");
        socket.once("$addClient", (status)=>{
            if(status) {
                alert("Клиент успешно добавлен!");
                return;
            } alert("Ошибка при добавлении клиента!");
        });
        console.log("Отправилось");
        socket.emit("addClient", {tourCode,surname: surname.trim(), name: name.trim(), patronimyc: patronimyc.trim(), email: email.trim(), birthdate: birthdate, 
        passport: passport, telephone: telephone});
    } catch(err) {
        console.log(err);
    } 
});


socket.once("$getTourCodes", (tourCodes)=>{
    try{  
    if(!tourCodes) throw new Error("Ошибка при получении данных!");
    let codesChoose = document.querySelector("#tour_code_select");
     codesChoose.innerHTML = `
     <option selected disabled> Выберите код тура </option>
     `;

     tourCodes.map((item)=>{
         codesChoose.innerHTML += `<option> ${item.code} </option>`;
     });

    }
    catch(err){
        console.log(err);
    }    

  });  

socket.emit("getTourCodes");


