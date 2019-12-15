const socket = io();

//переключение между входом и регистрацией
$(document).ready(function() {
    $(".loginForm").on("click",".tab", function(){
        $(".loginForm").find(".active").removeClass("active");
        $(this).addClass("active");
        $(".tabForm").eq($(this).index()).addClass("active");
    });
});

//обработка форм перед отправкой на сервер
document.querySelector('#button1').addEventListener('click', function (event) {
    event.preventDefault();
    try {
        let form = document.forms.signin;
        let email = form.email.value;
        let password = form.password.value;
        if(!email || !password) throw new Error("Пустое поле!");
        socket.once("$login", (status)=>{
            console.log(status);
            if(status) {        
                window.location.href = "./account.html";
                Cookies.set ('email',  status[0].email);        
                return;
            } alert("Пользователь не был найден в БД!");
        });
        socket.emit("login", {email: email.trim(), password: password.trim()});
    } catch(err) {
        console.log(err);
        writeError(err, signin);
    }
});

document.querySelector('#button2').addEventListener('click', function (event) {
    event.preventDefault();
    try {
        let form = document.forms.signup;
        let name = form.name.value;
        let surname = form.surname.value;
        let email = form.email.value;
        let password = form.password.value;
        let confirmPassword = form.confirmPassword.value;
        let agreement = form.checkbox.checked;
        if(!email || !name || !password || !surname || !confirmPassword) throw new Error("Пустое поле");
        if(!agreement) throw new Error("Нужно поставить галочку");
        if(password.length < 6 || password.length > 20) throw new Error("Пароль имеет неправильную длину");
        if(password != confirmPassword) throw new Error("Пароли не совпадают");
        socket.once("$addUser", (status)=>{
            if(status) {
                alert("Пользователь успешно добавлен!");
                return;
            } alert("Ошибка при добавлении пользователя!");
        });
        socket.emit("addUser", {name: name.trim(), surname: surname.trim(), email: email.trim(), password: password.trim()});
    } catch(err) {
        console.log(err);
        writeError(err, signup);
    } 
});

/*function writeError(error){
    input.onblur = function() {
        if (!input.value == '') { 
         input.classList.add('invalid');
          innerHTML = error;
        }
};
      
input.onfocus = function() {
        if (this.classList.contains('invalid')) {
          this.classList.remove('invalid');
          error.innerHTML = "";
        }
    };
}*/
           


