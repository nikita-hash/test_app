var tool_bar_user=document.getElementById('tool_users_type_button');
var users_block=document.getElementById('users_block');
var modalAddRecord=new bootstrap.Modal(document.getElementById('addRecordModal'));
var mapModal= new Map();
var mapRegModal=new Map();
var map=new Map();

function initMap(){
    map.set(1,users_block.children[1])
        .set(2,users_block.children[2])
        .set(3,users_block.children[3]);

    mapModal.set("addRecordModal",modalAddRecord);


}

function closeSecStatus(){
    var mas=document.querySelector(".sec_alert");
    for(i=0;i<mas.length;i++){
        mas[i].remove();
    }
}

function initDay(){
    var todayIndex = new Date().getDay();
    var blocks = document.querySelectorAll(".custom-block");
    blocks.forEach(function(block, index)
    {
        if (index < todayIndex) { block.classList.add("weekend") }
    });
}

initMap();
initDay();

function cancelRecord(item){
    console.log(item)
    axios.get('/doctor/cancel/record',{
        params: {
            idRecord: item.getAttribute("data-id")
        }
    })
        .then((response) => {
            console.log(response);
            location.reload();
        })
        .catch((error) => {
            console.log(error);
        });
}

function openToolUserMenu(id,map1){
    map1.forEach(el => {
        el.classList.add("close_block");
    })
    map1.get(id).classList.remove("close_block");
}

function openModal(item){
    sessionStorage.setItem("modal",item.getAttribute('data-widget-name'));
}


function showConfirmationModal(element) {
    var userId = element.getAttribute("data-id");
    var confirmationModal = document.getElementById("deleteUserModalLabel");
    modalDelUser.show();
    confirmationModal.querySelector('.btn-danger').setAttribute("onclick", "deleteUser(" + userId + ")");
}

function closeModal(name){
    mapModal.get(name).hide();
    sessionStorage.removeItem("modal");
}


function showAddRecordModal(element ,id_admin) {
    var userId = element.getAttribute("data-id");
    var confirmationModal = document.getElementById("addRecordModal");
    document.getElementById('custom-blocks-day').setAttribute('data-widget-name',userId);
    modalAddRecord.show();
    confirmationModal.querySelector('.btn-primary').setAttribute("onclick", "sendRecord(" + userId + ","+id_admin+")");
}

function createSchedule(array) {
    var startTime = new Date();
    startTime.setHours(8, 0, 0); // Устанавливаем начальное время (08:00 утра)
    var endTime = new Date();
    endTime.setHours(20, 0, 0); // Устанавливаем конечное время (20:00 вечера)

    var timeSlot = 15; // Интервал в минутах

    var scheduleContainer = document.getElementById("schedule"); // Получаем контейнер для расписания
    var setTime=new Set(array);

    // Цикл для создания блоков div с интервалами времени
    for (var time = startTime; time < endTime; time.setMinutes(time.getMinutes() + timeSlot)) {
        var div = document.createElement("div"); // Создаем новый блок div
        var hours = time.getHours().toString().padStart(2, "0"); // Получаем часы в формате "HH"
        var minutes = time.getMinutes().toString().padStart(2, "0"); // Получаем минуты в формате "MM"
        div.textContent = hours + ":" + minutes; // Установка текста блока div
        if(setTime.has(div.textContent)){
            div.classList.add("close");
        }
        div.addEventListener("click", function() {
            if(this.className!='close'){
                var selectedBlocks = document.getElementsByClassName("selected");

                // Удаляем класс "selected" у других блоков
                Array.from(selectedBlocks).forEach(function(block) {
                    block.classList.remove("selected");
                });

                // Добавляем класс "selected" выбранному блоку
                this.classList.add("selected");

                var selectedTime = document.getElementsByClassName("selected");
                var highlightedBlock = document.getElementsByClassName("highlight");
                var registerButton= document.getElementById("register_button_record")

                if (selectedTime.length > 0 && highlightedBlock.length > 0) {
                    registerButton.disabled = false ;
                }else {
                    registerButton.disabled = true;
                }
            }
        });

        scheduleContainer.appendChild(div); // Добавляем созданный блок div в контейнер расписания
    }
}

var timeBlock = document.getElementById("time_block");
var customBlocks = document.getElementsByClassName("custom-block");

// Привязываем обработчик клика к каждому кастомному блоку
Array.from(customBlocks).forEach(function(block) {
    block.addEventListener("click", function(el) {
        var scheduleContainer = document.getElementById("schedule");
        scheduleContainer.innerHTML="";
        var registerButton= document.getElementById("register_button_record")
        // Проверяем, является ли блок выходным
        if (!this.classList.contains("weekend")) {
            // Удаляем класс "highlight" у других блоков
            Array.from(customBlocks).forEach(function(otherBlock) {
                otherBlock.classList.remove("highlight");
            });

            axios.get('/doctor/open-time',{
                params:{
                    id:document.getElementById('custom-blocks-day').getAttribute('data-widget-name'),
                    number_day:el.target.getAttribute("data-widget-name"),
                }
            })
                .then((response) => {
                    console.log(response);
                    createSchedule(response.data);
                })
                .catch((error) => {
                    console.log(error);
                });


            timeBlock.style.display = "block";
            // Добавляем класс "highlight" блоку, по которому был клик
            this.classList.add("highlight");

            var selectedTime = document.getElementsByClassName("selected");


            if (selectedTime.length > 0) {
                registerButton.disabled= false;
            }else {
                registerButton.disabled=true;
            }
        }
        else{
            Array.from(customBlocks).forEach(function(otherBlock) {
                otherBlock.classList.remove("highlight");
                registerButton.disabled=true;
            });
        }

    });
});

function sendRecord(id,id_admin){
    var scheduleContainer = document.getElementById("schedule");
    var record = {
        doctor: {
            id: id,
        },
        user: {
            id: id_admin,
        },
        time: scheduleContainer.querySelector('.selected').textContent,
    };
    console.log(record);
    axios.post('/doctor/record',record,{
        params: {
            number_day: document.querySelector(".highlight").getAttribute("data-widget-name")
        }
    })
        .then((response) => {
            console.log(response);
            location.reload();
        })
        .catch((error) => {
            console.log(error);
        });
}

createSchedule();