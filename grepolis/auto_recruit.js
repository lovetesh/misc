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

function typeFromName(name)
{
	var typemap = {"0001": 'g',
				   "0002": 'a',
				   "0003": 'a',
				   "0004": 'a',
				   "0005": 'b',
				   "0006": 'b',
				   "0007": 'b',
				   "0008": 'b',
				   "0009": 'l',
				   "0010": 'b',
				   "0011": 'a',
				   '0012': 'a',
				   '0013': 'l',
				   '0014': 'o',
				   '0015': 'b',
				   '0016': 'b',
				   '0017': 'b',
				   '0018': 'o',
				   '0019': 'b',
				   '0020': 'o',
				   '0021': 'l',
				   '0022': 'l',
				   '0023': 'l',
				   '0024': 'l'
	};
	var type = typemap[name.substr(0, 4)];
	if (type == null)
	{
		return 'n';
	}
	return type;
}

function doRecruitLoop(recruit_towns)
{
	if (recruitTownIndex < recruit_towns.length)
	{
		var data = recruit_towns[recruitTownIndex];
		recruitTownIndex++;
		tryRecruit(data, typeFromName(data.name));
	}
	else
	{
		recruitLoopEnded();
	}
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
	var favor = frameWindow.GameData.units[data.units[i].id].favor;
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

	console.log("unit = " + data.units[i].id + " allowed = " + allowed);

	if (favor > 0 && allowed >= 1)
	{
		return 1;
	}

	if (allowed >= 70 / population && allowed >= 1)
	{
		if (allowed < 2)
		{
			return 1;
		}
		return parseInt(50 / population);
	}
	return 0;
}

function swapH(rl, a, b)
{
	var t = rl[a];
	rl[a] = rl[b];
	rl[b] = t;
}

function doTryRecruit(start, end, data, type)
{
	l = [];

	resource_list = [['wood', data.resources.wood], ['stone', data.resources.stone], ['iron', data.resources.iron]];
	if (resource_list[0][1] < resource_list[1][1])
	{
		swapH(resource_list, 0, 1);
	}
	if (resource_list[0][1] < resource_list[2][1])
	{
		swapH(resource_list, 0, 2);
	}
	if (resource_list[1][1] < resource_list[2][1])
	{
		swapH(resource_list, 1, 2);
	}

	var totalDef = 0;
	var totalLight = 0;

	var townInfo = frameWindow.ITowns.towns[data.id];

	totalLight = ((townInfo.units().attack_ship != null) ? townInfo.units().attack_ship : 0)
		+ ((townInfo.unitsOuter().attack_ship != null) ? townInfo.unitsOuter().attack_ship : 0)
		+ data.orders.docks.length * 3;

	// (townInfo.outer_units().sword != null) ? townInfo.outer_units().sword : 0

	townInfo.unitsOuter()

	totalDef = townInfo.getLandUnits().sword
		+ ((townInfo.unitsOuter().sword != null) ? townInfo.unitsOuter().sword : 0)
		+ townInfo.getLandUnits().hoplite
		+ ((townInfo.unitsOuter().hoplite != null) ? townInfo.unitsOuter().hoplite : 0)
		+ townInfo.getLandUnits().archer
		+ ((townInfo.unitsOuter().archer != null) ? townInfo.unitsOuter().archer : 0)
		+ data.orders.barracks.length * 30;

	console.log("town name:" + townInfo.name + ",left pop:" + data.free_population + 
		",totalDef:" + totalDef  + ",totalLight:" + totalLight + ",type:" + type);

	if (data.free_population < 180)
	{
		return false;
	}

	if (type == 'a')
	{
		if (resource_list[0][0] == "wood")
		{
			l = ['rider', 'slinger', 'hoplite'];
		}
		else if (resource_list[0][0] == "stone")
		{
			l = ['slinger', 'rider', 'hoplite'];
		}
		else 
		{
			l = ['hoplite', 'rider', 'slinger'];
		}
		if (totalLight < 120)
		{
			l[3] = 'attack_ship';
		}
	}
	else if (type == 'd')
	{
		if (resource_list[0][0] == "wood")
		{
			l = ['sword', 'hoplite', 'archer', 'bireme'];
		}
		else if (resource_list[0][0] == "stone")
		{
			l = ['bireme', 'sword', 'hoplite', 'archer'];
		}
		else 
		{
			l = ['hoplite', 'sword', 'archer', 'bireme'];
		}
		if (totalDef > 700)
		{
			l = ['bireme'];
		}
	}
	else if (type == 'o')
	{
		if (resource_list[0][0] == "wood")
		{
			l = ['sword', 'hoplite', 'archer'];
		}
		else if (resource_list[0][0] == "stone")
		{
			l = ['sword', 'hoplite', 'archer'];
		}
		else 
		{
			l = ['hoplite', 'sword', 'archer'];
		}
	}
	else if (type == 'c')
	{
		l = ['colonize_ship'];
	}
	else if (type == 'l')
	{
		l = ['attack_ship'];
	}
	else if (type == 'b')
	{
		l = ['bireme'];
	}
	else if (type == 'h')
	{
		l = ['hoplite'];
	}
	else if (type == 's')
	{
		l = ['slinger'];
	}
	else if (type == 'r')
	{
		l = ['rider'];
	}
	else if (type == 'g')
	{
		l = ['manticore', 'griffin'];
	}
	console.log("l = " + l);
	for (var id in l)
	{
		for (var i = start; i <= end; i++)
		{
			if (data.units[i].dep == null || !data.units[i].dep)
			{
				continue;
			}
			if (data.units[i].id == l[id])
			{
				if (tryRecruitFromOverview(data, i))
				{
					return true;
				}
				break;
			}
		}
	}
	return false;
}

function tryRecruit(data, type)
{
	// barracks
	if (data.orders.barracks.length < 5)
	{
		if (doTryRecruit(0, 17, data, type))
		{
			return;
		}
	}

	if (data.orders.docks.length < 5)
	{
		if (doTryRecruit(20, 21, data, type))
		{
			return;
		}
	}
	doRecruitLoop(g_recruitTowns);
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
	console.log(towns);
	var params = {
			"town_id":data.id,
			"towns": towns
			}
		    myAjaxPost('town_overviews', 'recruit_units', params, function(_data) {
		    	console.log(unit.id + " has been recruited.");
		    	doRecruitLoop(g_recruitTowns);
	    	}, function(_data) {doRecruitLoop(g_recruitTowns);});
	return true;
}