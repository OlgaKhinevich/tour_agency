const socket = io();

// отображение ФИО пользователя
try {
    socket.once("$getFIO", (status)=>{  
        if(status) {
            let email = Cookies.get('email');
            let fio = document.getElementById('fio');
            fio.innerHTML = `${status[0].name} ${status[0].surname}`;
            return;
        } else { 
            alert("Ошибка в отображении!");
        }
    });
    socket.emit("getFIO");
} catch(err) {
    console.log(err);
}

// событие клика на кнопку для отображения таблицы
document.querySelector('#button').addEventListener('click', function (event) {
    event.preventDefault();
    try {
        socket.once("$getBooking", (status)=>{
            console.log(status);  
            if(status) {
                let tableAreaSelector = document.getElementById('table');
                let headers = ['паспорт', 'код тура', 'дата отправления'];
                drawTable(tableAreaSelector, headers, status);
                return;
            } else { 
                alert("Ошибка в отображении!");
            }
        });
        socket.emit("getBooking");
       
    } catch(err) {
        console.log(err);
    }
});

// рисование таблицы
function drawTable(tableAreaSelector, headers = [], content = []){
    try {
        if(!tableAreaSelector || !headers || !headers.length) throw Error ("Неправильные параметры!");
        if(!tableAreaSelector) throw new Error("Нет поля таблицы!");
        let table = `
        <table>
            <thead>
                ${drawHeaders(headers)}
            </thead>
            <tbody>
                ${drawContent(content)}
            </tbody>
        </table>
            
            `;
        tableAreaSelector.insertAdjacentHTML("beforeEnd", table);
    }
    catch(err) {
        console.log(err);
    }
}

function drawHeaders(headers = []) {
    try {
        if(!headers || !headers.length) throw new Error("Ошибка!");
        let headersString = "";
        headers.map((item)=>{
            headersString += `<td> ${item} </td>`
        });
        return headersString;
    }
    catch(err) {
        console.log(err);
    }  
}

function drawContent(content = []) {
   try {
    console.log(content);
       let result = "";
       let departure = presentDate(content[0].departure);
       result += `<tr><td> ${content[0].passport} </td><td> ${content[0].code} </td><td> ${departure} </td></tr>`; 
       return result;
       
    }
    catch(err){
        console.log(err);
    }
}

// представление даты
function presentDate(serverDateString) {
    let serverDate = new Date(serverDateString);
    let day1 = serverDate.getDate();
    let day = addZeros(day1);
    let month1 = serverDate.getMonth()+1;
    let month = addZeros(month1);
    let year = serverDate.getFullYear();
    let date = `${day}.${month}.${year}`;
    return date;
}

function addZeros(number) {
    if(number<10) {
        return "0" + number;
    }
    else {return number;}
}
