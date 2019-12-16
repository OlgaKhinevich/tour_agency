const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mysql = require('mysql2/promise');

// настройка соединения
let connection;

async function init(){
    try {
        connection = await mysql.createConnection({
            database: 'travelagency',
            host: "localhost",
            port: 3306,
            user: "root",
            password: "Kartatoha20",
            insecureAuth: true
        });
    }
    catch(err) {
        console.log(err);
    }   
}

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/public/home.html");
});

app.get("/tour", (req, res)=>{
    try{
         const {place} = req.query;
         if(!place) throw new Error("Wrong tour place!");
          res.send(genTourPage(place));
    }
    catch(err){
      console.log(err);
      res.statusCode = 404;
      res.end();
    }

});

app.get("/login", (req, res)=>{
    res.sendFile(__dirname + "/public/login.html");
});

app.get("/account", (req, res)=>{
    res.sendFile(__dirname + "/public/account.html");
});

app.get("/form", (req, res)=>{
    res.sendFile(__dirname + "/public/form.html");
});

io.on("connection", function(socket){
    // добавление нового пользователя при регистрации
    socket.on("addUser", async(user)=>{
        try {
            const {name, surname, email, password} = user;
            // Запрос к БД
            let sqlQuery = `INSERT INTO users VALUES("${name}", "${surname}", "${email}", "${password}")`;
            
            // Проверка на наличие такого пользователя в БД
            let isExist= (await getSomeUser(email))[0];
            if(isExist.length) throw new Error("Такой пользователь уже существует!");
            let result = await connection.execute(sqlQuery);
            if (result[0].warningStatus===0) {
                socket.emit("$addUser", true);
                return;
            }
            socket.emit("$addUser", false);
        }
        catch(err) {
            console.log(err);
        }
    });
    
    // проверка на наличие пользователя в БД при входе
    socket.on("login", async(user)=>{
        try {
            const {email, password} = user;
            // Проверка на наличие пользователя в БД
            let isExist= (await findUser(email))[0];
            if(isExist.length === 0) throw new Error("Такого пользователя нет в БД!");
             
            let currentUser = isExist[0];
            if(currentUser.password !== password) throw new Error("Неправильный пароль!");
            socket.emit("$login",  currentUser.email);      
        }
        catch(err) {
            console.log(err);
            socket.emit("$login", false);
        }
    });

    // добавление клиента
    socket.on("addClient", async(client)=>{
        try {
            const {surname, name, patronimyc, email, birthdate, passport, telephone} = client;
            // Запрос к БД
            let sqlQuery = `INSERT INTO clients VALUES("${surname}", "${name}", "${patronimyc}", "${email}", "${birthdate}", "${passport}", "${telephone}")`;
          

            // // Проверка на наличие такого пользователя в БД
            let isExist= (await getClient(passport))[0];
            if(isExist.length) throw new Error("Клиент уже существует в БД!");
            let result = await connection.execute(sqlQuery);
      
            if (result[0].warningStatus!==0) throw new Error("Ошибка во время добавления!"); 

            socket.emit("$addClient", true);
            //  sqlQuery = `INSERT INTO booking VALUES("${passport}", ${})`;
           
        }
        catch(err) {
            console.log(err);
            socket.emit("$addClient", false);
        }
    });


    //получить коды всех существующих туров
    socket.on("getTourCodes", async()=>{
        try{
           let sqlQuery = `SELECT code FROM tours`;
           let [codes] = await connection.execute(sqlQuery);
           socket.emit("$getTourCodes", codes);
        }
        catch(err){
          console.log(err);
          socket.emit("$getTourCodes", false);
        }
    });



    //Получить информацию о бронировании
    socket.on("getBookingInfo", async ()=>{
        try{
        let sqlQuery = `SELECT c.surname, c.name,c.patronymic,c.passport,c.email, t.code, t.departure,t.arrive, t.type, t.visa 
        FROM booking AS b INNER JOIN clients AS c ON c.passport = b.passport INNER JOIN  tours AS t ON t.code = b.tour_code;`;

        let [bookingInfo] = await connection.execute(sqlQuery);
           
        socket.emit("$getBookingInfo", bookingInfo);

        }
        catch(err){
          console.log(err);
          socket.emit("$getBookingInfo", false);
        }
    });

    socket.on("getFIO", async()=>{
        try {
            let sqlQuery = `SELECT name, surname FROM users`;
            let result = await connection.execute(sqlQuery);
            if (result[0]) {
                socket.emit("$getFIO", result[0]);
                return;
            }
            socket.emit("$getFIO", false);
        }
        catch(err) {
            console.log(err);
        }
    });



    // //поиск клиентов
    // socket.on("findClients", async(clientSurname)=>{
    //     try{
    //       if(!clientSurname) throw new Error("Wrong params!");
    //       let sqlQuery = `SELECT * FROM clients WHERE surname LIKE "${clientSurname}%"`;
    //       let [clients] = await connection.execute(sqlQuery);
 

    //       socket.emit("$findClients", clients);
    //     }
    //     catch(err){
    //       console.log(err);
    //       socket.emit("$findClients", false);
    //     }
    // });

    // socket.on("getBooking", async()=>{
    //     try {
    //         let sqlQuery = `SELECT * FROM booking`;
    //         let result = await connection.execute(sqlQuery);
    //         console.log(result[0]);
    //         if (result[0]) {
    //             socket.emit("$getBooking", result[0]);
    //             return;
    //         }
    //         socket.emit("$getBooking", false);
    //     }
    //     catch(err) {
    //         console.log(err);
    //     }
    // });


    // socket.on("getTourInfo", async()=>{
    //     try {
    //         let sqlQuery1 = `SELECT * FROM tours`;
    //         let result1 = await connection.execute(sqlQuery1);
    //         console.log(result1);
    //         if (result1[0]) {
    //             socket.emit("$getTourInfo", result1[0]);
    //             return;
    //         }
    //         socket.emit("$getTourInfo", false);
    //     }
    //     catch(err) {
    //         console.log(err);
    //     }
    // });

    async function getSomeUser(email) {
        let sqlQuery = `SELECT * FROM users WHERE email="${email}"`;
        return await connection.execute(sqlQuery);
    }

    async function findUser(email) {
        let sqlQuery = `SELECT * FROM users WHERE email="${email}"`;
        return await connection.execute(sqlQuery);
    }

    async function getClient(passport) {
        let sqlQuery = `SELECT passport FROM clients WHERE passport="${passport}"`;
        return await connection.execute(sqlQuery);
    }
});

http.listen(3000, ()=>{
    console.log("Server is working successful!");
});

init();




//generate tour page
function genTourPage(place){
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Путешествие в Бразилию</title>
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800|Playfair+Display+SC:400,700,900&display=swap&subset=cyrillic" rel="stylesheet">
        <link rel="stylesheet" href="./style/scss/tour.css" type="text/css">
    </head>
    <body>
        <div class="container">
            <div class="img"> 
                <img src="img/${place}0.jpg" height="864px">
            </div>
            <div class="info">
                <img src="img/${place}1.jpg">
                <img src="img/${place}2.jpg">
                <img src="img/${place}3.jpeg">
                <h1 class="name"></h1>
                <h3 class="route">Рио-де-Жанейро – Ангра-дус-Рейс</h3>
                <div class="text-box">
                    <p class="dates"><strong>Даты:</strong> 05.01.2020-16.01.2020</p>
                    <p class="hotels"><strong>Отели:</strong> 
                        ATLANTIS COPACABANA 3* <br>
                        BAHIA OTHON PALACE 3* <br>
                    </p>
                    <p class="visa"><strong>Виза:</strong></p>
                    <p class="price"><strong>Цена:</strong> 75897 руб/чел. + перелет</p>    
            </div>
            <p class="description"></p>
            <a href="/home" class="button">назад</a>
            <a href="/form" class="button">забронировать</a>
            </div>      
        </div>
        <script src="js/tour.js"></script>
    </body>
    </html>
    `;
}