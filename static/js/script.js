$(document).ready(function() {

	// Регулярное выражение для проверки на положительное число
    // Не ипользовал $.isNumeric() - так как данная функция пропусукает значение
    // $.isNumeric( "8e5" ); $.isNumeric( 0xFF ); == true
    var re = /^[0-9]+$/

    // Проверка введеного значения
    $("#queryData").keyup(function(){
        // Проверка соответствия введеного числа
        var OK = re.exec($(this).val())
        // Если все ОК - проверка на ИНН/ОГРН
        if (OK) {
            // Проверка на ОГРН
            if ($(this).val().length == 13) {
                number = parseInt($(this).val())
                // console.log(number)
                document.getElementById("successAlert").innerHTML = "Введен ОГРН!"
                $("#successAlert").show()
                $("#errorAlert").hide()
            }
            // Проверка на ИНН
            else if ($(this).val().length == 10) {
                number = parseInt($(this).val())
                // console.log(number)
                document.getElementById("successAlert").innerHTML = "Введен ИНН!"
                $("#successAlert").show()
                $("#errorAlert").hide()
            }
            // Проверка на корректность введеных данных
            else {
                document.getElementById("errorAlert").innerHTML = "Длинна 10 = ИНН / Длинна 13 = ОГРН"
                $("#successAlert").hide()
                $("#errorAlert").show()
            }
        }
        // Иначе вывод сообщения об ошибке
        else {
            if ($(this).val().length>0){
                document.getElementById("errorAlert").innerHTML = "ОШИБКА!!! ВВЕДИТЕ НОМЕР КОРРЕКТНО"
                $("#successAlert").hide()
                $("#errorAlert").show()
            }
        }
    })


    function getLastRequest(){
    	$.ajax({			
			type : "GET",
			url : "/getLastRequest"
		})
		.done(function(data) {
			// console.log(data.allData)
			// Стереть старые данные
			$("#previousRequests").empty()
			$("#previousRequests").show()
			// В цикле перебираются все данные последних запросов
			
			$("#previousRequests").append("<li>"+data.id+ ": "+data.name+"</li>")
			
			// $("#previousRequests").text(data.allData).show()
		})		
    }

    myTimer = setTimeout(function(){}, 1)
    // Отправка формы для проверки ИНН или ОГРН
	$("#rmspRequest").click(function(event) {
		// event.preventDefault()
		clearTimeout(myTimer)
		$.ajax({
			data : {
				queryValue : $("#queryData").val()
			},
			type : "POST",
			url : "/sendRequest"
		})
		// Если ajax отработал
		.done(function(data) {
			// Выдать ошибку, если данные были введены некорректно
			if (data.error){
				$("#errorAlert").text(data.error)
                $("#successAlert").hide()
                $("#errorAlert").show()
                $("#lastRequest").hide()
                $("#previousRequests").hide()
			}
			// Выдать ошибку и последний запрос, если вышло время ожидания запроса на сервер
			else if (data.timeout){
				$("#errorAlert").text(data.timeout).show()
                $("#successAlert").hide()
                $("#lastRequest").hide()
                $("#previousRequests").hide()
			}
			// Выбать полученные данные, если все отработало без ошибок
			else{
				$("#successAlert").text(data.queryValue)
                $("#successAlert").show()
                $("#errorAlert").hide()
                $("#lastRequest").hide()
                $("#previousRequests").hide()
				console.log(data.queryValue)
			}
			// 3000000 = 1000*60*5 = 5 минут
			myTimer = setTimeout(getLastRequest, 3000000)	
		})

		// Отменить обновление страницы при вызове формы
		event.preventDefault()
		

	})

	// Получить данные последних запросов
	$("#checkData").click(function(event){

		$.ajax({			
			type : "GET",
			url : "/getData"
		})
		.done(function(data) {
			// console.log(data.allData)
			// Стереть старые данные
			$("#previousRequests").empty()		
			$("#previousRequests").show()
			// В цикле перебираются все данные последних запросов
			for(i=0; i<data.allData.length; i++){
				$("#previousRequests").append("<li>"+JSON.parse(data.allData[i])["id"]+ ": "+JSON.parse(data.allData[i])["name"]+"</li>")
			}
			// $("#previousRequests").text(data.allData).show()
		})
		// Отменить обновление страницы при вызове формы
		event.preventDefault()
	})

});