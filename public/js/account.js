const socket = io();

//начальные действия при загрузке страницы
function init(){

  // отображение ФИО пользователя
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
  socket.once("$getTourCodes", (tourCodes)=>{
    try{  
    if(!tourCodes) throw new Error("Ошибка при получении данных!");
    let codesChoose = document.querySelector("#codes");
     codesChoose.innerHTML = `
     <option selected disabled> Выберите код тура </option>
     <option value="all"> Все туры </option>
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
  socket.emit("getFIO");
  socket.emit("getBookingInfo");

}

// рисование таблицы
function drawTable(tableAreaSelector, headers = [], content = [], drawContent){
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
        tableAreaSelector.innerHTML = table;
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


//отрисовать таблицу с клиентами
function drawBookingContent(content){
    try{
     if(!content) throw new Error("Wrong params!");
     let result = "";

     for(let i=0; i<content.length; i++){
         result+=`
         <tr>
            <td> ${content[i].surname}</td>
            <td> ${content[i].name} </td>
            <td> ${content[i].patronymic}</td>
            <td> ${content[i].passport} </td>
            <td> ${content[i].email}</td>
            <td> ${content[i].code} </td>
            <td> ${presentDate( content[i].departure )}</td>
            <td> ${presentDate( content[i].arrive )}</td>
            <td> ${content[i].type}</td>
            <td> ${content[i].visa} </td>

        
         </tr>
         `;
     }

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

function showAllRows(){
    let rows = document.querySelectorAll("tbody tr");
    for(let i=0; i<rows.length; i++){
       if(rows[i].classList.contains("hide"))
       rows[i].classList.remove("hide");
    }
}

function isUserEqual(surname, name, farthername,equalString){
  let fio = `${surname.trim()} ${name.trim()} ${farthername.trim()}`;

  return fio.startsWith(equalString);
}


//HANDLERS =====================================================================================================

socket.on("$getBookingInfo", (info)=>{
    try{
       if(!info) throw new Error("Ошибка во время получения информации о туре!");
       const tableArea = document.querySelector("#tableArea");
       const headers = ["Фамилия","Имя","Отчество","Паспорт","Email","Код","Дата отъезда", "Дата приезда","Тип", "Виза"];
       drawTable(tableArea, headers, info, drawBookingContent );
    }
    catch(err){
      console.log(err);
    }
 });

//туры
document.querySelector("#codes").addEventListener("change", (e)=>{
   let table = document.querySelector("#tableArea");
   let rows = table.querySelectorAll("tbody tr");
   let selectValue = e.target.value;
   
   showAllRows();
   if(selectValue === "all") return;
   for(let i=0; i<rows.length; i++){
       if(rows[i].children[5].innerText !== selectValue){
             rows[i].classList.add("hide");
       }
   }

});


document.querySelector("#button").addEventListener("click", ()=>{
   let searchRowValue = document.querySelector("#finding").value;
   let table = document.querySelector("#tableArea");
   let rows = table.querySelectorAll("tbody tr");

   showAllRows();
   if(searchRowValue === "") return;
   for(let i=0; i<rows.length; i++){
       if(!isUserEqual(rows[i].children[0].innerText, rows[i].children[1].innerText,rows[i].children[2].innerText, searchRowValue )){
             rows[i].classList.add("hide");
       }
   }
});


init();