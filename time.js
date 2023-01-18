import puppeteer, { ConsoleMessage } from "puppeteer"
import fs from 'fs'

var dir = './data';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	
		// Subjects of each class
    let allSchedules = {}
    
        await page.goto(`https://ittterni.altervista.org//orario_itt_2022-2023_riservato/Classi/4CIA.html`);
    
        const data = await page.evaluate(() => {

            let doubleHeightMatrix = {}
            let rows = document.querySelectorAll('tr')
            let doubleHeight = ['1','1','1','1','1','1']


            for( let i=1 ; i<rows.length ; i++){
                let tableData = rows[i].querySelectorAll('td')

                for( let k=1 ; k<tableData.length ; k++){
                    if(doubleHeight[k-1] == '2'){
                        doubleHeight[k-1] = '0'    
                    }
                    else {
                        doubleHeight[k-1] = (tableData[k].rowSpan == '2') ? '2' : '1'
                    }
                    console.log(doubleHeight[k-1]);
                }
                console.log(doubleHeight[k-1]);
            }
            


            // let subjects = document.querySelectorAll('td')
            // trasformali in array
            // let trs = Array(subjects.length)
            
            // let tds = Array

            // MODIFICARE QUI PER L'ALGORITMO DELLE ORE


            // per ogni materia prendi il text context lo spazio occupato per righe e il colore
            // bisogna aggiungere il \n dopo ogni caratteristica ,
            // perche dopo fara lo split('\n') e trasformera la stringa in un array
            // for(let i=0 ; i<subjects.length ; i++){
            //     tds[i] = 
            //     subjects[i].rowSpan +
            //     '\n' + 
            //     subjects[i].getAttribute('color') + 
            //     '\n' + 
            //     subjects[i].getAttribute('bgcolor') + 
            //     subjects[i].textContent
            // }
            
            return doubleHeightMatrix
        });
            
        console.log(data);
        // console.log(data);
        let schedule = [] 
            
        // for(let i=0 ; i<data.length ; i++){
        //     // Creo un array seperando la stringa di prima
        //     // E tolgo i caratteri inutili con filter
        //     let paragraph = data[i].split("\n").filter(empty => empty!='' && empty!='\u00A0')
        //     // console.log(paragraph)

        //     let classRoom = paragraph[paragraph.length-1]
        //     let classNumber = classRoom.replace(/\D/g, "")

        //     let objParagraph

        //     (paragraph.length >= 6)
        //     ?objParagraph = {
        //         type: 'subject',
        //         height: paragraph[0],
        //         color: paragraph[1],
        //         backgroundColor: paragraph[2],
        //         subject: paragraph[3],
        //         teacher: paragraph[4],
        //         classRoom: classRoom,
        //         // Utilizzo le regex per prendere solo il numero dalla stringa
        //         classNumber: (+classNumber > 200) ? classNumber.slice(0,-1) : classNumber
        //     }
        //     :objParagraph = {
        //         backgroundColor: null,
        //         height: paragraph[0],
        //         date: (paragraph.length == 4) ? paragraph[paragraph.length-1] : null 
        //     }

        //     schedule.push(objParagraph)

        // }

        // console.log(schedule);

	

	
	await browser.close();
})();

