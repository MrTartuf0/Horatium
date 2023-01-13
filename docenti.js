import puppeteer from "puppeteer"
import fs from 'fs'


(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	
	// List of all the classrooms
	// PUBLIC SCHEDULE
	// await page.goto(`https://ittterni.altervista.org//orario_itt_2022-2023_pubblico/`);
	// PRIVATE SCHEDULE
	await page.goto(`https://ittterni.altervista.org//orario_itt_2022-2023_riservato/index.html`);

  	const allClasses = await page.evaluate(() => {
		let classes = Array.from(document.querySelectorAll('p a.mathema'))
		return classes.map(e => e.textContent)
  	});

	// Subjects of each class
	let allSchedules = {}

	for(let i=0 ; i<allClasses.length ; i++){
		await page.goto(`https://ittterni.altervista.org//orario_itt_2022-2023_pubblico/Classi/${allClasses[i]}.html`);
	
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
		  
		let schedule = [] 
		  
		  for(let i=0 ; i<data.length ; i++){
			// Creo un array seperando la stringa di prima
			// E tolgo i caratteri inutili con filter
			let paragraph = data[i].split("\n").filter(empty => empty!='' && empty!='\u00A0')
			console.log(paragraph)

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
		Object.assign(allSchedules, {[allClasses[i]]: schedule});
	}
	
	
	fs.writeFile("schedule.json", JSON.stringify(allSchedules, null, 4), (err, result) => {
		if(err) console.log('error', err);
	});

	fs.writeFile("classes.json", JSON.stringify(allClasses, null, 4), (err, result) => {
		if(err) console.log('error', err);
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

	fs.writeFile("classesMatrix.json", JSON.stringify(classesMatrix, null, 4), (err, result) => {
		if(err) console.log('error', err);
	});



	// console.log(allSchedules)
	
	await browser.close();
})();

