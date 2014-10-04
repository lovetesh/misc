var famingtime = 300;

var global_start = false;
var isGettingInfo = true;
var townIndex = 0;
var alltowns = null;
var timeoutid = -1;
var minRequestInterval = 2;
var blacklist = [];

function getTimeoutTime()
{
	var hasCaptain = document.getElementById("hasCaptain").checked;
	if (!hasCaptain)
	{
		return famingtime * 1000;
	}
	else
	{
		var requestNumber = alltowns.length * 2;
		return 1000 * (famingtime + 10 - requestNumber * minRequestInterval);
	}
}

function getRequestIntervalTime()
{
	return 1000 * minRequestInterval;
	//return 1000 * (minRequestInterval + parseInt(Math.random() * 2));
}

function getUserName()
{
	return frameWindow.ITowns.getCurrentTown().name;
}

function recruitLoopEnded()
{
	console.log("recruitloop ended.");
	doGetTradeInfoAndTrade();
}

function cultureLoopEnded()
{
	console.log("cultureloop ended.");
	doGetBuidingInfoAndBuild();
}

function tradeLoopEnded()
{
	console.log("tradeLoop ended.");
}

// Need add auto_cave and auto_trade

// auto_trade: For every city, if resource is too much. send to other city (1. culture needed city. 2. resource needed city.) 
// if need not culture(culture 1 hour away) and pop is not enough(< 200). And resource > base value(10000), send to other culture city.
// auto_cave: When the silver > 18000 and need not trade to other people. send 3000 silver in cave.

// for auto farm. need sort the city and loot the city with less counter first.

// for culture. do all city festival every time. (do a city info to know whether need one)

// for cave. only nearly full. save 2000. (loop)

// for trade. must record all the current running market info.
// need record all the trading info. from time, end time, from city, end city and update info for every updates.
// Do more things by the info.

// auto favor monster recruiting.

// for auto battle.
// 1. auto search map. get map info, island info and city info.
// 2. make city table(save/load from file).
// 3. get city info and switch to city. start attacking. (mainly for favor.) // need to test whether the player is dead one.
// 4. gerpolis intel the city and gain information. (gather the message in 1 and update infomration later.)
// 5. get the dead city and attack it.
// 6. get the bp city and attack it.
// 7. get report information and update the table.

function buildLoopEnded()
{
	console.log("buildLoop ended.");
	doGetRecruitInfoAndRecruit();
}

function doCheckStatusAndDoSomething()
{
	doGetCultureInfoAndCulture();
}

function startFromLoader()
{
	linkData();
	startLoop();
}

function stopLoop()
{
	global_start = false;
	if (timeoutid != -1)
	{
		clearTimeout(timeoutid);
	}
}

var checkTimeoutId = -1;
var checkIdleTimeInterval = 1000 * 60 * 1;
var maxIdleTime = 1000 * 60 * 5;	// 5 minutes.
var lastStartTime = -1;

function checkIdle()
{
	var curTime = new Date().getTime();
	console.log("checkIdle, time = " + curTime);
	if (lastStartTime != -1 && (curTime - lastStartTime) > (maxIdleTime + famingtime * 1000))
	{
		console.log("check idling, restart.");
		if (timeoutid != -1)
		{
			clearTimeout(timeoutid);
		}
		doStartRun();
	}
	setTimeout(checkIdle, checkIdleTimeInterval);
}

function startLoop()
{
	if (checkTimeoutId != -1)
	{
		clearTimeout(checkTimeoutId);
	}
	setTimeout(checkIdle, checkIdleTimeInterval);
	global_start = true;
	if (timeoutid != -1)
	{
		clearTimeout(timeoutid);
	}
	doStartRun();
}

function doStartRun()
{
	lastStartTime = new Date().getTime();
	if (!global_start)
	{
		return;
	}
	blacklist = document.getElementById("blacklist").value.split(",");
	famingtime = parseInt(document.getElementById("farmingTime").value);


	console.log("doStartRun");
	townIndex = 0;
	isGettingInfo = true;
	lootmoodvalue = parseInt(document.getElementById("lootMoral").value);
	var hasCaptain = document.getElementById("hasCaptain").checked;
	if (hasCaptain)
	{
		captainSortFarmTown();
		doRun();
	}
	else
	{
		doRunNoCaptain();
	}
}

function lootLoopEnded()
{
	// switch to other action list.	
	doCheckStatusAndDoSomething();
	timeoutid = setTimeout(doStartRun, getTimeoutTime());
	console.log("successful one turn.");
	// switch to build.
}
