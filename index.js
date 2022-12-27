import puppeteer from "puppeteer"
import fs from 'fs'



(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	// List of all the classrooms
	await page.goto(`https://ittterni.altervista.org//orario_itt_2022-2023_pubblico/`);

  	const data = await page.evaluate(() => {
		let classes = Array.from(document.querySelectorAll('p a.mathema'))

		return classes.map(e => e.textContent)
  	});

	fs.writeFile("classes.json", JSON.stringify(data), function(err, result) {
		if(err) console.log('error', err);
	});

	await browser.close();
})();


(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(`https://ittterni.altervista.org//orario_itt_2022-2023_pubblico/Classi/4CIA.html`);

  	const data = await page.evaluate(() => {
		let subjects = document.querySelectorAll('td.nodecWhite , td.nodecBlack')
    	let tds = Array.from(subjects)

		for(let i=0 ; i<subjects.length ; i++){
			tds[i] = subjects[i].rowSpan + tds[i].textContent
		}

		return tds
  	});
	  
	let schedule = [] 
	  
  	for(let i=0 ; i<data.length ; i++){
		let paragraph = data[i].split("\n")
		schedule.push(
			paragraph.filter(empty => empty!='' && empty!='\u00A0')
		)
	}
		
	fs.writeFile("schedule.json", JSON.stringify(schedule), function(err, result) {
		if(err) console.log('error', err);
	});
		
	console.log(schedule);
  	
	await browser.close();
})();
