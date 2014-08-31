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
		var requestNumber = alltowns.length * 2 + 1;
		return 1000 * (famingtime - requestNumber * minRequestInterval);
	}
}

function getRequestIntervalTime()
{
	return 1000 * (2 + parseInt(Math.random() * 2));
}

function getUserName()
{
	return frameWindow.ITowns.getCurrentTown().name;
}

function recruitLoopEnded()
{

}

function buildLoopEnded()
{
	console.log("buildLoop ended, do nothing, you can switch to recruit process.");
	doGetRecruitInfoAndRecruit();
}

function doCheckStatusAndDoSomething()
{
	// first get current wareh"ouse information."
	var buildingOrders = frameWindow.ITowns.getCurrentTown().buildingOrders();
	var orderedNum = buildingOrders.models.length;
	var currentResources = frameWindow.ITowns.getCurrentTown().getCurrentResources();
	var storage = frameWindow.ITowns.getCurrentTown().getStorage();
	// decide whether the resources is too much.
	var upperlimit = storage * 0.2;
	if (upperlimit < currentResources.wood || upperlimit < currentResources.iron ||
		upperlimit < currentResources.stone)
	{
		doGetBuidingInfoAndBuild();
	}
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

function startLoop()
{
	global_start = true;
	if (timeoutid != -1)
	{
		clearTimeout(timeoutid);
	}
	doStartRun();
}

function doStartRun()
{
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
