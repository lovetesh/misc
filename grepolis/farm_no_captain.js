


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
