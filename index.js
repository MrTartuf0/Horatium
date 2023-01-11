import puppeteer from "puppeteer"
import fs from 'fs'


(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	
	// List of all the classrooms
	await page.goto(`https://ittterni.altervista.org//orario_itt_2022-2023_pubblico/`);

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
			let tds = Array.from(subjects) 

			// per ogni materia
			for(let i=0 ; i<subjects.length ; i++){
				tds[i] = subjects[i].rowSpan + tds[i].textContent
			}
	
			return tds.slice(7)
		  });
		  
		let schedule = [] 
		  
		  for(let i=0 ; i<data.length ; i++){
			let paragraph = data[i].split("\n")
			schedule.push(
				paragraph.filter(empty => empty!='' && empty!='\u00A0')
			)
		}
		Object.assign(allSchedules, {["c"+allClasses[i]]: schedule});
	}
	
	
	fs.writeFile("schedule.json", JSON.stringify(allSchedules), function(err, result) {
		if(err) console.log('error', err);
	});


	console.log(allSchedules)

	await browser.close();
})();

