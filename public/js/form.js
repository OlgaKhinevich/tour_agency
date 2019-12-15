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
        if(!surname || !name || !patronimyc || !birthdate || !passport || !telephone) throw new Error("Пустое поле");
        if(passport.length !== 9) throw new Error("Неверные серия и номер паспорта!");
        socket.once("$addClient", (status)=>{
            if(status) {
                alert("Клиент успешно добавлен!");
                return;
            } alert("Ошибка при добавлении клиента!");
        });
        socket.emit("addClient", {surname: surname.trim(), name: name.trim(), patronimyc: patronimyc.trim(), email: email.trim(), birthdate: birthdate, 
        passport: passport, telephone: telephone});
    } catch(err) {
        console.log(err);
    } 
});


           


