try {
    socket.once("$getTourInfo", (status)=>{  
        if(status) {
            let tourName = document.querySelector('.name');
            tourName.innerHTML = `${status[0].name}`;
            let route = document.querySelector('.route');
            //??
            let dates = document.querySelector('.dates');
            dates.innerHTML = `${status[0].departure} - ${status[0].arriving}`;
            let hotels = document.querySelector('.hotels');
            //???
            let visa = document.querySelector('.visa');
            visa.innerHTML = `${status[0].name}`;

            let description = document.querySelector('.description');
            description.innerHTML = `${status[0].description}`;
            return;
        } else { 
            alert("Ошибка в отображении!");
        }
    });
    socket.emit("getTourInfo");
} catch(err) {
    console.log(err);
}