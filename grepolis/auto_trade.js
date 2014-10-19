
var g_movements;
var g_tradeTowns;
var g_tmp;

function doGetTradeInfoAndTrade()
{
	console.log("doGetTradeInfoAndTrade");
	myAjaxGet('town_overviews', 'trade_overview', {}, function(_data) {
		g_tmp = _data;
		g_movements = _data.movements;
		g_tradeTowns = _data.towns;
		initTradeTownInfo();
		startTradeLoop();
	});
}

var tradeTownIndex = 0;
var tradeTownNum = 0;
var initedTradeTowns = new Object();

function initTradeTownInfo()
{
	for (var p = 0; p < g_tradeTowns.length; p++)
	{
		if (g_tradeTowns[p].id != null)
		{
			var future_res = new Object();
			future_res.wood = g_tradeTowns[p].res.wood;
			future_res.stone = g_tradeTowns[p].res.stone;
			future_res.iron = g_tradeTowns[p].res.iron;
			g_tradeTowns[p].future_res = future_res;
		}
	}
	for (var p = 0; p < g_movements.length; p++)
	{
		var data = g_movements[p];
		if (data.to != null && data.to.link != null)
		{
			var index = data.to.link.indexOf('>') + 1;
			var name = data.to.link.substr(index, 4);
			var id = findTownIdFromName(name);
			if (id != null)
			{
				var dest = findTradeTown(id);
				if (dest != null)
				{
					dest.future_res.wood += data.res.wood;
					dest.future_res.iron += data.res.iron;
					dest.future_res.stone += data.res.stone;
				}
			}
		}
	}
}

function findTownIdFromName(name)
{
	var towns = frameWindow.ITowns.getTowns()
	for (var p in towns)
	{
		if (towns[p].id != null && towns[p].name == name)
		{
			return towns[p].id;
		}
	}
	return null;
}

function findTradeTown(id)
{
	for (var p in g_tradeTowns)
	{
		if (g_tradeTowns[p].id == id)
		{
			return g_tradeTowns[p];
		}
	}
	return null;
}

function startTradeLoop()
{
	tradeTownIndex = 0;
	tradeTownNum = g_tradeTowns.length;
	doTradeLoop();
}

function doTradeLoop()
{
	if (tradeTownIndex < tradeTownNum)
	{
		tradeTownIndex++;
		tryTrade(g_tradeTowns[tradeTownIndex - 1]);
	}
	else
	{
		tradeLoopEnded();
	}
}

function canCelebrate(id)
{
	var towndata = frameWindow.ITowns.towns[id];
	if (typeFromName(towndata.name) == 'c')
	{
		return true;
	}
	if (typeFromName(towndata.name) == 'gc')
	{
		return true;
	}
	if (g_culture_data == null)
	{
		return false;
	}
	if (g_culture_data[id] != null && g_culture_data[id].party != null)
	{
		return false;
	}
	// storage > 18000 and academy >= 30.
	
	if (towndata.getStorage() < 18000)
	{
		return false;
	}
	if (towndata.getBuildings().attributes.academy < 30)
	{
		return false;
	}

	return true;
}

function canTrade(id)
{
	var towndata = frameWindow.ITowns.towns[id];
	return towndata.getBuildings().attributes.market >= 10;
}

function tradeFromLimit(type, id)
{
	var num = 0;
	if (type == 'stone')
		num = 18000;
	if (type == 'iron')
	{
		num = 15000;
	}
	if (type == 'wood')
	{
		num = 15000;
	}
	if (!canCelebrate(id))
	{
		num = parseInt(num / 2);
	}
	return num;
}

function tradeToLimit(type, id)
{
	if (!canCelebrate(id))
	{
		return 0;
	}
	var num = 0;
	if (type == 'stone')
		num = 18000;
	if (type == 'iron')
	{
		num = 15000;
	}
	if (type == 'wood')
	{
		num = 15000;
	}
	return num;
}

function tryTrade()
{
	var data = g_tradeTowns[tradeTownIndex - 1];
	console.log("try trade " + data.id + " res:" + data.res.wood + "," + data.res.stone + "," + data.res.iron);
	if (!canTrade(data.id))
	{
		doTradeLoop();
	}
	if (trade('stone', tradeFromLimit('stone', data.id)))
	{
		return;
	}
	if (trade('iron', tradeFromLimit('iron', data.id)))
	{
		return;
	}
	if (trade('wood', tradeFromLimit('wood', data.id)))
	{
		return;
	}
	doTradeLoop();
}

function trade(type, limit)
{
	var id = tradeTownIndex - 1;
	var data = g_tradeTowns[id];
	if (data.res[type] <= limit)
	{
		return false;
	}
	var extra = data.res[type] - limit;
	if (extra >= 2500 && data.cap >= 2500)
	{
		return tradeWithPriority(type, 2500, limit);
	}
	return false;
}

function tradeWithPriority(type, n, limit)
{
	console.log("tradeWithPriority: type:" + type + " limit:" + limit);
	var res_num = 1000000;
	var dest = -1;
	for (var i = 0; i < tradeTownNum; i++)
	{
		if (i != tradeTownIndex - 1)
		{
			var t = g_tradeTowns[i];
			limit = tradeToLimit(type, t.id);
			var total = t.future_res[type] + n;
			if (total < t.storage && total < res_num && t.future_res[type] < limit && t.storage > limit)
			{
				res_num = t.future_res[type];
				dest = i;
			}
		}
	}
	if (dest != -1)
	{
		doTrade(type, n, dest);
		return true;
	}
	return false;
}

function doTrade(type, n, i)
{
	var params = {
		"from" : g_tradeTowns[tradeTownIndex - 1].id,
		"to" : g_tradeTowns[i].id,
		"wood" : 0,
		"stone" : 0,
		"iron" : 0,
		"town_id" : frameWindow.ITowns.getCurrentTown().id
	}
	params[type] = n;
	g_tradeTowns[i].future_res[type] += n;
	myAjaxPost('town_overviews', 'trade_between_own_town', params, function(_data) {
		    	console.log(type + ":" + n + " has been traded from " + params.from + " to " + params.to);
		    	doTradeLoop();
	    	});
}
