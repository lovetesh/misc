var frameWindow = window;
var gpAjax = window.gpAjax;

var createGame = function() {
	var frame = document.getElementById("game");
	if (frame)
		frame.remove();

	frame = document.createElement('iframe');
	frame.width = 1024;
	frame.height = 800;
	frame.id = "game";
	frame.frameborder = '0';
	frame.scrolling = 'no';
	frame.src = 'http://en79.grepolis.com';
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
	gpAjax = frameWindow.gpAjax;
	frameWindow.NotificationLoader.oldRecvData = frameWindow.NotificationLoader.recvNotifyData;

	frameWindow.NotificationLoader.recvNotifyData= function(data, inited)
	{
		console.log(data);
		frameWindow.NotificationLoader.oldRecvData(data, inited);
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

function getTimeoutTime()
{
	var requestNumber = alltowns.length * 2 + 1;
	return 1000 * (famingtime - requestNumber * minRequestInterval);
}

function getRequestIntervalTime()
{
	return 1000 * (2 + parseInt(Math.random() * 2));
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
	doRun();
}

function doRun()
{
	if (!global_start)
	{
		return;
	}
	setTimeout(dodoRun, getRequestIntervalTime());
}

function lootLoopEneded()
{
	// switch to other action list.	
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
			lootLoopEneded();
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

// List all want to do and give priority.
// 



