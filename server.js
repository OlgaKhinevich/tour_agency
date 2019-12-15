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
            user: "root",
            password: "xnat2699ol",
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
    res.sendFile(__dirname + "/public/tour.html");
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
            console.log(result);
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
            socket.emit("$login", true);      
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
            sqlQuery = `INSERT INTO booking VALUES("${passport}")`;

            // Проверка на наличие такого пользователя в БД
            let isExist= (await getClient(passport))[0];
            if(isExist.length) throw new Error("Клиент уже существует в БД!");
            let result = await connection.execute(sqlQuery);
            if (result[0].warningStatus===0) {
                socket.emit("$addClient", true);
                return;
            }
            socket.emit("$addClient", false);
        }
        catch(err) {
            console.log(err);
        }
    });

    socket.on("getBooking", async()=>{
        try {
            let sqlQuery = `SELECT * FROM booking`;
            let result = await connection.execute(sqlQuery);
            console.log(result[0]);
            if (result[0]) {
                socket.emit("$getBooking", result[0]);
                return;
            }
            socket.emit("$getBooking", false);
        }
        catch(err) {
            console.log(err);
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

    socket.on("getTourInfo", async()=>{
        try {
            let sqlQuery1 = `SELECT * FROM tours`;
            let result1 = await connection.execute(sqlQuery1);
            console.log(result1);
            if (result1[0]) {
                socket.emit("$getTourInfo", result1[0]);
                return;
            }
            socket.emit("$getTourInfo", false);
        }
        catch(err) {
            console.log(err);
        }
    });

    async function getSomeUser(email) {
        let sqlQuery = `SELECT * FROM users WHERE email="${email}"`;
        return await connection.execute(sqlQuery);
    }

    async function findUser(email) {
        let sqlQuery = `SELECT email FROM users WHERE email="${email}"`;
        return await connection.execute(sqlQuery);
    }

    async function getClient(passport) {
        let sqlQuery = `SELECT passport FROM clients WHERE passport="${passport}"`;
        return await connection.execute(sqlQuery);
    }
});

http.listen(3001, ()=>{
    console.log("Server is working successful!");
});

init();




