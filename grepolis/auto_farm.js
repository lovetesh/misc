var frameWindow = window;
var gpAjax = window.gpAjax;

var createGame = function() {
	var frame = document.getElementById("game");
	if (frame)
		frame.remove();

	frame = document.createElement('iframe');
	frame.width = 1024;
	frame.height = 600;
	frame.id = "game";
	frame.frameborder = '0';
	frame.scrolling = 'no';
	frame.src = 'http://en80.grepolis.com';
	frame.sandbox = "allow-same-origin allow-scripts allow-forms";
	document.body.appendChild(frame);	

	var result = document.getElementById("game");
	frameWindow = frame.contentWindow;
	return result;
};

function myAjaxPost(type, action, params, cb, cb2)
{
	var callback =
	{
		success:function(_context,_data,_flag,_t_token)
		{
			cb(_data);
		},
		error:function(_context,_data,_t_token)
		{
			if (cb2)
			{
				cb2(_data);
			}
			console.log(_data);
		}
	}
	gpAjax.ajaxPost(type, action, params, false, callback);
}

function myAjaxGet(type, action, params, cb)
{
	var callback =
	{
		success:function(_context,_data,_flag,_t_token)
		{
			cb(_data);
		},
		error:function(_context,_data,_t_token)
		{
			console.log(_data);
		}
	}
	gpAjax.ajaxGet(type, action, params, false, callback);
}

function linkData()
{
	if (frameWindow.NotificationLoader.oldRecvData != null)
	{
		return;
	}
	gpAjax = frameWindow.gpAjax;
	frameWindow.NotificationLoader.oldRecvData = frameWindow.NotificationLoader.recvNotifyData;

	frameWindow.NotificationLoader.recvNotifyData = function(data, inited)
	{
		console.log(data);
		if (data.notifications != null)
		{
			for (var i = 0; i < data.notifications.length; i++)
			{
				handleNotification(data.notifications[i]);
			}
		}
		frameWindow.NotificationLoader.oldRecvData(data, inited);
	}
}

var botcheckAudio = new Audio('botcheck.mp3');
var attackAudio = new Audio('attack.wav');
var testAudio = new Audio('test.wav'); 

function handleNotification(n)
{
	if (n.type == frameWindow.NotificationType.INCOMING_ATTACK)
	{
		attackAudio.play();
	}
	else if (n.type == frameWindow.NotificationType.BOTCHECK)
	{
		botcheckAudio.play();
	}
}

var famingtime = 300;

var global_start = false;
var isGettingInfo = true;
var townIndex = 0;
var alltowns = null;
var timeoutid = -1;
var minRequestInterval = 2;
var blacklist = [3994];
var blacklist0 = [10263];
var blacklist1 = [5827];
var blacklist_list = [blacklist0, blacklist1];
blacklist = blacklist1;
var autoBuild = false;

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

var recruitTownIndex = 0;
var recruitTownNum = 0;
var g_recruitTowns = null;

function doGetRecruitInfoAndRecruit()
{
	var autoRecruit = document.getElementById("autoRecruit").checked;
	if (!autoRecruit)
	{
		return;
	}
	console.log("doGetRecruitInfoAndRecruit");
	myAjaxGet('town_overviews', 'recruit_overview', {}, function(_data) {
		g_data = _data.html;
		g_recruitTowns = _data.data.towns;
		startRecruit();
		});
}

function startRecruit()
{
	recruitTownIndex = 0;
	doRecruitLoop(g_recruitTowns);
}

function doRecruitLoop(recruit_towns)
{
	if (recruitTownIndex < recruit_towns.length)
	{
		var data = recruit_towns[recruitTownIndex];
		recruitTownIndex++;
		tryRecruitPrepare(data);
	}
	else
	{
		recruitLoopEnded();
	}
}

function tryRecruitPrepare(data)
{
	if (data.name[0] == 'd')
	{
		tryRecruit(data, true);
	}
	else if (data.name[0] = 'a')
	{
		tryRecruit(data, false);
	}
	// other case.
}

function isDefenseUnits(name)
{
	return name == "sword" || name == "archer" || name == "hoplite" || name == "bireme";
}

function isAttackUnits(name)
{
	return name == "slinger" || name == "rider" || name == "attack_ship";
}

function getAllowedRecruitNumber(data, i)
{
	if (!data.units[i].dep)
	{
		return 0;
	}

	var allowed = 1000000;

	var resources = data.resources;
	var consumes = frameWindow.GameData.units[data.units[i].id].resources;
	var population = frameWindow.GameData.units[data.units[i].id].population;
	if (consumes.iron != 0 && resources.iron / consumes.iron < allowed)
	{
		allowed = resources.iron / consumes.iron;
	}
	if (consumes.stone != 0 && resources.stone / consumes.stone < allowed)
	{
		allowed = resources.stone / consumes.stone;
	}
	if (consumes.wood != 0 && resources.wood / consumes.wood < allowed)
	{
		allowed = resources.wood / consumes.wood;
	}
	if (allowed > 40 / population)
	{
		return 20 / population;
	}
	return 0;
}

function tryRecruit(data, defense)
{
	// barracks
	if (data.orders.barracks.length < 7)
	{
		for (var i = 0; i <= 6; i++)
		{
			if (!data.units[i].dep)
			{
				continue;
			}
			if ((defense && isDefenseUnits(data.units[i].id))
				|| (!defense && isAttackUnits(data.units[i].id)))
			{
				if (tryRecruitFromOverview(data, i))
				{
					return;
				}
			}
		}
	}
	if (data.orders.docks.length < 7)
	{
		for (var i = 20; i <= 21; i++)
		{
			if (!data.units[i].dep)
			{
				continue;
			}
			if ((defense && isDefenseUnits(data.units[i].id))
				|| (!defense && isAttackUnits(data.units[i].id)))
			{
				if (tryRecruitFromOverview(data, i))
				{
					return;
				}
			}
		}
	}
}

function tryRecruitFromOverview(data, i)
{
	var unit = data.units[i];
	var num = getAllowedRecruitNumber(data, i);
	if (num == 0)
	{
		return false;
	}
	var towns = {};
	towns[data.id] = {};
	towns[data.id][unit.id] = num;
	var params = {
			"town_id":data.id,
			"towns": towns
			}
		    myAjaxPost('town_overviews', 'recruit_units', params, function(_data) {
		    	console.log(unit.id + " has been recruited.");
		    	doRecruitLoop(g_recruitTowns);
	    	});
	    	return true;
}

function recruitLoopEnded(data)
{

}

function doGetBuidingInfoAndBuild()
{
	var autoBuild = document.getElementById("autoBuild").checked;
	if (!autoBuild)
	{
		return;
	}
	console.log("doGetBuidingInfoAndBuild");
	myAjaxGet('town_overviews', 'building_overview', {}, function(_data) {
		var content = _data.html;
		content = content.substr(content.indexOf("var town_data"));
		content = content.substr(0, content.indexOf("BuildingOverview.init"));
		eval(content);
		startBuildLoop(building_data);
		});
}

var buildTownIndex = 0;
var buildTownNum = 0;
var buildTowns = [];

function buildLoopEnded()
{
	console.log("buildLoop ended, do nothing, you can switch to recruit process.");
	doGetRecruitInfoAndRecruit();
}

function startBuildLoop(building_data)
{
	buildTownIndex = 0;
	buildTowns = [];
	var i = 0;
	for (var p in building_data)
	{
		buildTowns[i] = p;
		i++;
	}
	buildTownNum = i;
	doBuildLoop(building_data);
}

function doBuildLoop(building_data)
{
	if (buildTownIndex < buildTownNum)
	{
		var data = building_data[buildTowns[buildTownIndex]];
		buildTownIndex++;
		tryBuildFromOverview(buildTowns[buildTownIndex - 1], building_data);
	}
	else
	{
		buildLoopEnded();
	}
}

function getUserName()
{
	return frameWindow.ITowns.getCurrentTown().name;
}

function tryBuildFromOverview(townId, building_data)
{
	console.log("try build " + townId);
	var data = building_data[townId];
	// low
	var buildingList = {'main' : 14,
						'lumber' : 15,
						'ironer' : 10, 
						'stoner' : 8, 
						'storage' : 15, 
						'academy' : 16, 
						'docks' : 10, 
						'farm' : 20, 
						'market' : 10, 
						'temple' : 5, 
						'hide' : 1, 
						'wall' : 5, 
						'barracks' : 10
					};
	if (buildOneFromList(townId, buildingList, building_data))
	{
		return true;
	}
	// medium
	buildingList = {'main' : 24,
						'farm' : 30, 
						'storage' : 22, 
						'academy' : 30, 
						'docks' : 20, 
						'market' : 10, 
						'temple' : 5, 
						'hide' : 5, 
						'wall' : 10, 
						'lumber' : 20,
						'ironer' : 20, 
						'stoner' : 20, 
						'barracks' : 15
					};
	if (buildOneFromList(townId, buildingList, building_data))
	{
		return true;
	}
	// unlimited
	// medium
	buildingList = {'main' : 24,
						'farm' : 99, 
						'storage' : 99, 
						'academy' : 99, 
						'docks' : 20, 
						'market' : 20, 
						'temple' : 10, 
						'hide' : 10, 
						'wall' : 20, 
						'lumber' : 99,
						'ironer' : 99, 
						'stoner' : 99, 
						'barracks' : 20
					};
	if (buildOneFromList(townId, buildingList, building_data))
	{
		return true;
	}
}

function buildOneFromList(townId, buildingList, building_data)
{
	var data = building_data[townId];
	var towndata = frameWindow.ITowns.towns[townId];
	if (frameWindow.ITowns.towns[townId].buildingOrders().length == 7)
	{
		return;
	}
	if (towndata[0] == "n")
	{
		return false;
	}
	for (var key in buildingList)
	{
		var value = buildingList[key];
		var bd = data[key];
		if (bd.enough_resources && bd.enough_storage && !bd.has_max_level && value > bd.level)
		{
			var params = {
			"town_id":townId,
			"building_id":key,
			"tear_down":0,
			"no_bar":0,
			"build_for_gold":false
			}
		    myAjaxPost('town_overviews', 'build_building', params, function(_data) {
		    	console.log(key + " has been built.");
		    	doBuildLoop(building_data);
	    	});
	    	return true;
		}
	}
	return false;
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

function doRun()
{
	if (!global_start)
	{
		return;
	}
	setTimeout(dodoRun, getRequestIntervalTime());
}

function lootLoopEnded()
{
	// switch to other action list.	
	doCheckStatusAndDoSomething();
	timeoutid = setTimeout(doStartRun, getTimeoutTime());
	console.log("successful one turn.");
	// switch to build.
}

function dodoRun()
{
	if (alltowns == null)
	{
		doGetAllTowns();
	}
	else
	{
		if (townIndex >= alltowns.length)
		{
			lootLoopEnded();
		}
		else
		{
			if (!alltowns[townIndex].valid)
			{
				townIndex++;
				isGettingInfo = true;
				doRun();
				return;
			}
			if (isGettingInfo)
			{
				isGettingInfo = false;
				doGetTownInfo(townIndex);
			}
			else
			{
				townIndex++;
				isGettingInfo = true;
				doLootTown(townIndex - 1);
			}
		}
	}
}

function doGetTownInfo(cur_town_idx)
{
	console.log("doGetTownInfo");
	
	var towninfo = alltowns[cur_town_idx];

	var params = {
		"island_x":towninfo.island_x,
		"island_y":towninfo.island_y,
		"booty_researched":towninfo.booty_researched,
		"trade_office":towninfo.trade_office
	}
    myAjaxGet('farm_town_overviews', 'get_farm_towns_for_town', params, function(_data) {
    	towninfo.farm_town_list = _data.farm_town_list;
    	towninfo.loads_data = _data.loads_data;
    	doRun();
    	});
}

function doGetAllTowns()
{
	console.log("doGetAllTowns");
	myAjaxGet('farm_town_overviews', 'index', {}, function(_data) {alltowns = _data.towns;
		for (var i = 0; i < alltowns.length; i++)
		{
			alltowns[i].valid = true;
		}
		doRun();
		});
}

function doLootTown(cur_town_idx)
{
	console.log("doLootTown" + cur_town_idx);
	var towninfo = alltowns[cur_town_idx];
	var loot = false;
	var farm_town_list = towninfo.farm_town_list;
	var townlist = [];

	console.log(farm_town_list.length);

	for (var i = 0; i < farm_town_list.length; i++)
	{
		var farm_town = farm_town_list[i];
		if (farm_town.loot != null && farm_town.loot < (Date.now() / 1000))
		{
			townlist.push(farm_town.id);
		}
	}

	for (var i = 0; i < blacklist.length; i++)
	{
		if (towninfo.id == blacklist[i])
		{
			doRun();
			return;
		}
	}

	if (townlist.length == 0)
	{
		console.log("townlist is empty");
		doRun();
		return;
	}

	if (towninfo.loads_data[famingtime].mood == 0)
	{
		loot = true;
	}

	var params = {
		farm_town_ids: townlist,
        time_option: famingtime,
        claim_factor: loot ? 'double' : 'normal',
        current_town_id: towninfo.id
	};
	myAjaxPost('farm_town_overviews', 'claim_loads', params, function(_data) {
		console.log(_data);
		if (_data.error != null)
		{
			var towninfo = alltowns[cur_town_idx];
			towninfo.valid = false;
		}
		doRun();},
		function(_data)
		{
			if (_data.claimed_resources_per_resource_type == 0)
			{
				var towninfo = alltowns[cur_town_idx];
				towninfo.valid = false;
				doRun();
			}
	});
}

function hasFreeBuildingSlots()
{
	return frameWindow.MM.collections.BuildingOrder[1].length < 7;
}

priorityList = ["buildHigh", "buildLow", "recruitHigh", "recruitLow"];
// buildHigh is to build important.
// buildLow is to use resources.
// recruitHigh is to use all resources but the recruit time must less than 4 hours.
// recruitLow is to use resources > half of current storage.
// send to balance resources.

// Every city need their own configs for buildings and recuitment.

// LS, Birs, Hoplite, slinger, horse, land defenses.

function doImportant()
{

}

function BuildOnce()
{

}

// first to build a list
// first recruit with half of resources.
// second build.
// startlist = ['resources', 'center', 'warehouse', 'academy', 'farm']

// List all want to do and give priority.
// 


var lootmoodvalue = 86;
var tryloot = true;
var farminfoStage = 0;
var farmStage = 1;
var lootinfoStage = 2;
var lootStage = 3;
var townlist = [65,66,67,68,69,70,71,72];

function doRunNoCaptain()
{
	townindex = 0;
	townstage = farminfoStage;
	doContinueRun();
}

function ajaxFarmInfo()
{
	gpAjax.ajaxGet('farm_town_info', 'claim_info', {id:townlist[townindex]}, false, myinfocallback);
}

function ajaxFarm()
{
	gpAjax.ajaxPost('farm_town_info','claim_load',
		{target_id:townlist[townindex],claim_type:"normal",time:famingtime}, false, myfarmcallback);		
}

function ajaxLootInfo()
{
	gpAjax.ajaxGet('farm_town_info', 'pillage_info', {id:townlist[townindex]}, false, mylootinfocallback);
}

function ajaxLoot()
{
	gpAjax.ajaxPost('farm_town_info','claim_load',
		{target_id:townlist[townindex],claim_type:"double",time:famingtime}, false, mylootcallback);
}

function reallyDo()
{
	if (townindex >= townlist.length)
	{
		console.log("successfully complete a loop.");
		doCheckStatusAndDoSomething();
		timeoutid = setTimeout(doStartRun, getTimeoutTime());
	}
	else
	{
		if (townstage == farminfoStage)
		{
			ajaxFarmInfo();
		}
		else if (townstage == farmStage)
		{
			ajaxFarm();
		}
		else if (townstage == lootinfoStage)
		{
			ajaxLootInfo();
		}
		else if (townstage == lootStage)
		{
			ajaxLoot();
		}
	}
}

var delayTime = 0;

function doContinueRun()
{
	if (!global_start)
	{
		return;
	}
	// delay some random time for any request.
	if (delayTime > 0)
	{
		setTimeout(reallyDo, parseInt(Math.random() * delayTime));
	}
	else
	{
		reallyDo();
	}
}
var lastdata = null;

function handleClaim(_data)
{
	console.log("handleDemandInfo.");
	lastdata = _data;
	if (parseInt(_data.json.lootable_at) < parseInt(_data.json.time_now) && parseLootable(_data))
	{
		if (tryloot && parseMood(_data) >= lootmoodvalue)
		{
			townstage=lootinfoStage;
		}
		else
		{
			townstage=farmStage;
		}
	}
	else
	{
		townstage=farminfoStage;
		townindex++;
	}
	doContinueRun();
}

function handleFarm(_data)
{
	console.log("demand successful!");
	console.log(_data);
	townstage=farminfoStage;
	townindex++;
	doContinueRun();
}

function parseMood(_data)
{
	var index = _data.html.indexOf("%</div");
	var nextstring = _data.html.slice(index - 20, index);
	var mood = parseInt(nextstring.slice(nextstring.indexOf(">") + 1));
//	console.log("parsed mood = " + mood);
	return mood;
}

function parseLootable(_data)
{
	str = '<div class="farm_bar_container bold farm_bar_loot small" style="width: 84px">';
	var index = _data.html.indexOf(str);
	var nextstring = _data.html.slice(index + str.length, index + str.length + 25);
	index = nextstring.indexOf('</div>');
	var usefulstr = nextstring.slice(0, index);
	var nums = usefulstr.split('/');
	console.log("lootable: " + usefulstr);
	return parseInt(nums[1]) - parseInt(nums[0]) > 200;
}

function handleLootInfo(_data)
{
	console.log("handleLootInfo");
//	console.log(_data);
	lastdata = _data;
	if (parseInt(_data.json.lootable_at) < parseInt(_data.json.time_now) && parseMood(_data) >= lootmoodvalue)
	{
		townstage=lootStage;
	}
	else
	{
		townstage=farminfoStage;
		townindex++;
	}
	doContinueRun();
}

function handleLoot(_data)
{
	console.log("loot successful!");
	console.log(_data);
	townstage=farminfoStage;
	townindex++;
	doContinueRun();
}

myinfocallback=
	{
		success:function(_context,_data,_flag,_t_token)
		{
//			mylog("farm info success");
			handleClaim(_data);
		},
		error:function(_context,_data,_t_token)
		{
			console.log("farm info error");
			console.log(_data);
		}
	};

myfarmcallback=
	{
		success:function(_context,_data,_flag,_t_token)
		{
//			mylog("farm success");
			handleFarm(_data);
		},
		error:function(_context,_data,_t_token)
		{
			console.log("farm error");
			console.log(_data);
		}
	};

mylootinfocallback=
	{
		success:function(_context,_data,_flag,_t_token)
		{
//			mylog("loot info success");
			handleLootInfo(_data);
		},
		error:function(_context,_data,_t_token)
		{
			console.log("loot info error");
			console.log(_data);
		}
	};

mylootcallback=
	{
		success:function(_context,_data,_flag,_t_token)
		{
//			mylog("loot success");
			handleLoot(_data);
		},
		error:function(_context,_data,_t_token)
		{
			console.log("loot error");
			console.log(_data);
		}
	};

myoverviewcallback=
{
		success:function(_context,_data,_flag,_t_token)
		{
			handleOverview(_data);
		},
		error:function(_context,_data,_t_token)
		{
			console.log("loot error");
			console.log(_data);
		}
}
