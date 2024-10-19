const monthNamesEt = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
const timeNow = new Date();
const minuteNow = timeNow.getMinutes();
const secondNow = timeNow.getSeconds();
const hourNow = timeNow.getHours();
const dayNow = timeNow.getDay();
const dateNow = timeNow.getDate();
const monthNow = timeNow.getMonth();
const yearNow = timeNow.getFullYear();

const dateEt = function dateEt(){
	console.log("Praegu on: " + timeNow);
	//console.log("Praegu on: " + dateNow + "." + (monthNow + 1) + "." + yearNow);
	//console.log("Praegu on: " + dateNow + ". " + monthNamesEt[monthNow] + " " + yearNow);
	let dateNowEt = dateNow + ". " + monthNamesEt[monthNow] + " " + yearNow;
	return dateNowEt;
}

const givenDateFormatted = function(gDate){
	let specDate = new Date(gDate)
	return specDate.getDate() + "." + monthNamesEt[specDate.getMonth()] + " " +  specDate.getFullYear();
}

const weekDayEt = function(){
	const weekdayNamesEt = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];
	return weekdayNamesEt[dayNow];
}


const timeFormattedEt = function(){
	return hourNow + ":" + minuteNow + ":" + secondNow;
}

const timeElapsed = function(gDate){
	let startDate = new Date (gDate);
	let today = new Date();
	let msDiff = today - startDate
	let daysDiff = Math.round(msDiff / (1000 * 3600 * 24));
	return daysDiff
}

const timeUnFormatted = function () {
	let comparableDate = new Date(timeNow.getUTCFullYear(), timeNow.getUTCMonth(), timeNow.getUTCDate());
	return comparableDate;
}

const defaultExpireDate = function () {
	let expireDate = new Date(timeNow.getUTCFullYear(), timeNow.getUTCMonth(), timeNow.getUTCDate()+10);
	return expireDate;
}

//kriba funktsioon mis votab kuupaeva ja ytleb mitu paeva selleni on, kas see on praegu voi sellest on moodas x paeva



//valime sobiva array ja siis sylitame sealt valja sobiva tegevuse
//function partOfDay(){
	//let activities = ["Oma und parajaks", "Kohvi", "Koolitükke", "Midagi imelikku"];
	//let scheduleSun = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0];
	//let scheduleMon = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 0, 0];
	//let scheduleTue = [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0];
	//let scheduleWed = [0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 0, 0];
	//let scheduleThu = [0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 0, 0];
	//let scheduleFri = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0];
	//let scheduleSat = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0];
	//let schedules = [scheduleSun, scheduleMon, scheduleTue, scheduleWed, scheduleThu, scheduleFri, scheduleSat];
	
	//votab tanase paeva, siis votab tanase paeva graafikust tegevuse ja paneb selle tegevuseks. See RNG osa on testimiseks.
	//const todaysSchedule = schedules[Math.round(Math.random() * 6)];
	//const partOfDay = activities[todaysSchedule[Math.round(Math.random() * 23)]];
	
	//const todaysSchedule = schedules[dayNow];
	//const partOfDay = activities[todaysSchedule[hourNow]];
	//return partOfDay;
//}

//lugesin ülesande kirjelduse läbi
function partOfDay() {
	let activityNow = "midagi on valesti";
	if (dayNow == 0 || dayNow >= 6) {
	  if (hourNow <= 9) {
		activityNow = "oma und parajaks";
	 	 } else if (hourNow <= 22) {
			activityNow = "vaba aja tegevusi";
	  }
	}
	if (dayNow > 0 && dayNow <= 5) {
	  if (hourNow <= 8) {
		activityNow = "oma und parajaks";
	 	 } else if (hourNow >= 9 && hourNow <= 16) {
			activityNow = "koolitükke!";
	  		} else if (hourNow > 16 && hourNow < 22){
				activityNow = "tunnivälisi tegevusi";
	 			 } else if (hourNow >= 22) {
					activityNow = "magamisega";
	  }
	}
	return activityNow;
  }
	
		



module.exports = {
	monthNamesEt: monthNamesEt, weekDayEt: weekDayEt, dateEt: dateEt, timeFormattedEt: timeFormattedEt, partOfDay: partOfDay, givenDateFormatted: givenDateFormatted, timeElapsed: timeElapsed,
	timeUnFormatted: timeUnFormatted, defaultExpireDate: defaultExpireDate
};
