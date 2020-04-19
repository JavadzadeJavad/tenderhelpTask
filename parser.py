from flask import Flask, render_template, request, jsonify
import requests

import json
import simplejson

from pprint import pprint



app = Flask(__name__)

@app.route('/')
def index():
	return render_template("index.html")

# Запись данных в json файл
def writeData(data):
	fileBD = open("dataBase.json","a")
	fileBD.write(simplejson.dumps(data, ensure_ascii=False))
	fileBD.write('\n')
	fileBD.close()


# category: 1 - Микропредприятие
# category: 2 - Малое предприятие
@app.route("/sendRequest", methods=["POST"])
def sendRequest():
	queryValue = request.form["queryValue"]

	# Проверка на корректность введенных данных
	if len(queryValue) == 10 or len(queryValue) == 13:
		# Url по которому извлекаются данные
		url = "https://rmsp.nalog.ru/search-proc.json"
		
		try:
		# Запрос на сервер
			response = requests.post(url, data={
					"mode" : "quick",
					"page": "",
					"query": queryValue,
					"pageSize": "10",
					"sortField": "NAME_EX",
					"sort": "ASC"
			 	})
		
			# Статус запроса 
			status = response.status_code
			# Данные запроса
			respondValue = response.json()
			# Проверка на наличие ИНН или ОГРН по номеру в базе
			if len(respondValue["data"])>0:
				respondValue = respondValue["data"][0]
			
				# Проверка на тип предприятия
				if respondValue["category"] == 1:
					# Запись данных в json файл
					data = dict({"id":queryValue, "name": "Микропредприятие"})
					writeData(data)
					return jsonify({"queryValue" : "Микропредприятие"})
				elif respondValue["category"] == 2:
					# Запись данных в json файл
					data = dict({"id":queryValue, "name": "Малое предприятие"})
					writeData(data)
					return jsonify({"queryValue" : "Малое предприятие"})
			else:
				# Запись данных в json файл
				data = dict({"id":queryValue, "name": "Не существует"})
				writeData(data)
				return jsonify({"error" : "Данного ИНН или ОГРН не существует"})
		except Exception as e:
			print(e)			
			return	jsonify({"timeout" : "Время обработки запроса истекло"})
	else:
		return jsonify({"error" : "Введите ИНН или ОГРН корректно"})
	
	
@app.route("/getLastRequest", methods=["GET"])
def getLastRequest():
	# Пустой список, где будут хранится данные последних запросов
	requestsArray = list()

	# Чтение данных из локального файла
	# Если бы данные хранились на сервере requests.get(url)
	fileBD = open("dataBase.json","r")
	# Конвертация в формат json
	fileData = fileBD.read().splitlines()
	for req in fileData:
		requestsArray.append(json.loads(req))
		
	return jsonify({"id" : requestsArray[len(requestsArray)-1]["id"],
					"name" : requestsArray[len(requestsArray)-1]["name"]
	})



@app.route("/getData", methods=["GET"])
def getData(last=False):
	# Пустой список, где будут хранится данные последних запросов
	requestsArray = list()
	
	# Чтение данных из локального файла
	# Если бы данные хранились на сервере requests.get(url)
	fileBD = open("dataBase.json","r")
	# Конвертация в формат json
	fileData = fileBD.read().splitlines()
	for req in fileData:
		requestsArray.append(json.loads(req))	
	
	return jsonify({"allData" : fileData})
	
		

	

if __name__ == '__main__':
	app.run(debug=True)


