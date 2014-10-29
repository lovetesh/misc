frameWindow.HelperTown.townSwitch(169);
frameWindow.Game.townId

townInfo = frameWindow.ITowns.towns[169];
townInfo.units()


// for example. LS city only send LS, d city send birs and fast_transport,
// a city send LS and fast_transport, b city send birs. g city send god.

// first only support l, d, b, a.

var g_attack_info = [];
var g_collect_info_index = 0;
var g_collect_town_id = 0;

function collectInfoTowards(townId)
{
	// init g_attack_info by alltowns
	for (var i = 0; i < alltowns.length; i++)
	{
		var o = new Object();
		o.id = alltowns[i].id;
		o.info = null;
		g_attack_info[i] = o;
	}
	g_collect_info_index = 0;
	g_collect_town_id = townId;

	doSwitchTownToCollect();
}

function doSwitchTownToCollect()
{
	if (g_collect_info_index >= alltowns.length)
	{
		console.log("collect done");
		console.log(g_attack_info);
		return;
	}
	var switchTo = g_attack_info[g_collect_info_index].id;
	if (frameWindow.Game.townId != switchTo)
		frameWindow.HelperTown.townSwitch(switchTo);
	setTimeout(doCollectLoop, 3000);
}

function doCollectLoop()
{
	var townId = g_collect_town_id;
	if (g_collect_info_index < alltowns.length)
	{
		myAjaxGet('town_info', 'attack', {"id": townId}, function(_data) {
    		g_attack_info[g_collect_info_index].info = _data.json;
    		g_collect_info_index++;
    		doSwitchTownToCollect(townId);
    	});
	}
}


myAjaxGet('town_info', 'attack', {"id": 756}, function(_data) {
    	g_data = _data.json;
    	});


/*
1. You need gather information and give config, send/cancel for perfect timing.
2. You set a target, tool traverse all your city and list all the travel time with all kinds of different thing. And it can give you a sorted list to let you choose some of them.
3. Select your troop sending towns and town type(configured in other place), Send CS first. other city will follow the CS time and send at right time. Time will not perfect, but at least you need not send troop one by one......
4. Another option, split your attacking and supporting troop into several pieces and send, you cancel the bad timing ones.
*/

