import puppeteer from "puppeteer"
import fs from 'fs'

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(`https://ittterni.altervista.org//orario_itt_2022-2023_pubblico/Classi/4CIA.html`);

  	const data = await page.evaluate(() => {
    	let tds = Array.from(document.querySelectorAll('td.nodecWhite , td.nodecBlack'))
    	return tds.map(e => e.textContent)
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
		
	console.log(data);
	console.log(schedule);
	console.log(data.length);
  	
	await browser.close();
})();

