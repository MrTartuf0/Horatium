import puppeteer, { ConsoleMessage } from "puppeteer"
import fs from 'fs'

var dir = './data';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	
	// PUBLIC SCHEDULE
	// await page.goto(`https://ittterni.altervista.org//orario_itt_2022-2023_pubblico/`);

	// PRIVATE SCHEDULE
	await page.goto(`https://ittterni.altervista.org//orario_itt_2022-2023_riservato/index.html`);

	const allClasses = await page.evaluate(() => {
		classes = Array.from(document.querySelectorAll('td')[0].querySelectorAll('p a'))
		return classes.map(e => e.textContent)
	});

	const allTeachers = await page.evaluate(() => {
		teachers = Array.from(document.querySelectorAll('td')[1].querySelectorAll('p a'))
		return teachers.map(e => e.textContent)
	});

	const allClassRooms  = await page.evaluate(() => {
		classrooms = Array.from(document.querySelectorAll('td')[2].querySelectorAll('p a'))
		return classrooms.map(e => e.textContent)
	});

	
	let fileNames = [['Classi' , 'Docenti' , 'Aule', ],
	[allClasses , allTeachers , allClassRooms, ]]

	let keySchedule = {}
	
	// SCRAPER CLASSI PER OGNI CLASSE, PER OGNI DOCENTE, E PER OGNI AULA 
	for(let k=0 ; k<3 ; k++){
		
		// Subjects of each class
		let allSchedules = {}
		
		for(let i=0 ; i<fileNames[1][k].length ; i++){
			await page.goto(`https://ittterni.altervista.org//orario_itt_2022-2023_riservato/${fileNames[0][k]}/${fileNames[1][k][i]}.html`);
		
			const data = await page.evaluate(() => {
				// Prendi tutti gli elementi con il tag td
				let subjects = document.querySelectorAll('td')
				// trasformali in array
				let tds = Array(subjects.length) 
	
				// per ogni materia prendi il text context lo spazio occupato per righe e il colore
				// bisogna aggiungere il \n dopo ogni caratteristica ,
				// perche dopo fara lo split('\n') e trasformera la stringa in un array
				for(let i=0 ; i<subjects.length ; i++){
					tds[i] = 
					subjects[i].rowSpan +
					'\n' + 
					subjects[i].getAttribute('color') + 
					'\n' + 
					subjects[i].getAttribute('bgcolor') + 
					subjects[i].textContent
				}
				
				return tds
			});
			  

			// console.log(data);
			let schedule = [] 
			  
			  for(let i=0 ; i<data.length ; i++){
				// Creo un array seperando la stringa di prima
				// E tolgo i caratteri inutili con filter
				let paragraph = data[i].split("\n").filter(empty => empty!='' && empty!='\u00A0')
				// console.log(paragraph)
	
				let classRoom = paragraph[paragraph.length-1]
				let classNumber = classRoom.replace(/\D/g, "")
	
				let objParagraph
	
				(paragraph.length >= 6)
				?objParagraph = {
					type: 'subject',
					height: paragraph[0],
					color: paragraph[1],
					backgroundColor: paragraph[2],
					subject: paragraph[3],
					teacher: paragraph[4],
					classRoom: classRoom,
					// Utilizzo le regex per prendere solo il numero dalla stringa
					classNumber: (+classNumber > 200) ? classNumber.slice(0,-1) : classNumber
				}
				:objParagraph = {
					backgroundColor: null,
					height: paragraph[0],
					date: (paragraph.length == 4) ? paragraph[paragraph.length-1] : null 
				}
	
				schedule.push(objParagraph)
	
			}
	
			Object.assign(allSchedules, {[fileNames[1][k][i]]: schedule});
		
		}
		// Sopra ci sta keyschedule = {}
		Object.assign(keySchedule, {[fileNames[0][k]]: allSchedules});
		console.log(`${fileNames[0][k]} salvati!`);
		

		// Questo solo per le liste di nomi, classi, e aule
		fs.writeFile(`./data/${fileNames[0][k]}.json`, JSON.stringify(fileNames[1][k], null, null), (err, result) => {
			if(err) console.log('error', err);
		});
		
	}
	

	// Tutti gli orari in un unico file
	// il secondo null è per togliere l'identazione dal json
	// salvando 1.2mb di spazio 
	fs.writeFile(`./data/schedule.json`, JSON.stringify(keySchedule, null, null), (err, result) => {
		if (err) throw err;
	});
	

	// Suddivisione delle classi a seconda dell'anno
	let classesMatrix = []
	for(let i=0 ; i<5 ; i++){
		let singleYear = []
		for(let j=0 ; j<allClasses.length ; j++){
			if(allClasses[j][0] == i+1){
				singleYear.push(allClasses[j])
			}
		}
		classesMatrix.push(singleYear)
	}
	
	// Esporto in JSON un array suddiviso per indice, es [0] = tutte le classi prime e cosi via
	fs.writeFile("./data/classesMatrix.json", JSON.stringify(classesMatrix, null, null), (err, result) => {
		if(err) console.log('error', err);
	});


	
	await browser.close();
})();

