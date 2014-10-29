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
				   "0002": 'g',
				   "0003": 'l',
				   "0004": 'a',
				   "0005": 'g',
				   "0006": 'd',
				   "0007": 'd',
				   "0008": 'd',
				   "0009": 'l',
				   "0010": 'd',
				   "0011": 'a',
				   '0012': 'a',
				   '0013': 'l',
				   '0014': 'o',
				   '0015': 'o',
				   '0016': 'o',
				   '0017': 'o',
				   '0018': 'b',
				   '0019': 'b',
				   '0020': 'b',
				   '0021': 'g',
				   '0022': 'b',
				   '0023': 'l',
				   '0024': 'd',
				   '0025': 'a',
				   '0026': 'l',
				   '0027': 'o',
				   '0028': 'l',
				   '0029': 'h',
				   '0030': 'l',
				   '0031': 'o',
				   '0032': 'd',
				   '0033': 'd',
				   '0034': 'o',
				   '0035': 'o',
				   '0036': 'o',
				   '0037': 'o'
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

function getUnitNumber(townInfo, unit)
{
	return ((townInfo.units()[unit] != null) ? townInfo.units()[unit] : 0)
		+ ((townInfo.unitsOuter()[unit] != null) ? townInfo.unitsOuter()[unit] : 0);
}

function doTryRecruit(start, end, data, type)
{
	l = [];

	var totalDef = 0;
	var totalLight = 0;

	var townInfo = frameWindow.ITowns.towns[data.id];

	totalLight = getUnitNumber(townInfo, "attack_ship")
		+ data.orders.docks.length * 5;

	var moreSword = getUnitNumber(townInfo, "sword") > getUnitNumber(townInfo, "archer");

	totalDef = getUnitNumber(townInfo, "sword") + getUnitNumber(townInfo, "archer") + getUnitNumber(townInfo, "hoplite")
		+ data.orders.barracks.length * 50;

//	console.log("town name:" + townInfo.name + ",left pop:" + data.free_population + 
//		",totalDef:" + totalDef  + ",resources:" + data.resources + ",type:" + type);

	if (data.free_population < 200)
	{
		return false;
	}

	if (type == 'a')
	{
		l = {
			'rider' : 10000,
			'slinger' : 10000,
			'hoplite' : 10000,
			'attack_ship' : 70,
			'small_transporter' : 70
		};
	}
	else if (type == 'aa')
	{
		l = {
			'rider' : 10000,
			'slinger' : 10000,
			'hoplite' : 10000,
			'attack_ship' : 0,
		};
	}
	else if (type == 'd')
	{
		if (totalDef > 1000)
		{
			l = {
				'bireme' : 200,
				'small_transporter' : 50
			};
		}
		else if (moreSword)
		{
			l = {
			'hoplite' : 10000,
			'archer' : 10000,
			'bireme' : 200,
			'small_transporter' : 50
			};
		}
		else
		{
			l = {
			'hoplite' : 10000,
			'sword' : 10000,
			'bireme' : 200,
			'small_transporter' : 50
			};
		}
	}
	else if (type == 'o')
	{
		if (moreSword)
		{
			l = {
			'hoplite' : 10000,
			'archer' : 10000,
			'small_transporter' : 120
			};
		}
		else
		{
			l = {
			'hoplite' : 10000,
			'sword' : 10000,
			'small_transporter' : 120
			};
		}
	}
	else if (type == 'c')
	{
		l = {
			'colonize_ship' : 5
		};
	}
	else if (type == 'gc')
	{
		l = {
			'manticore' : 10000,
			'griffin' : 10000,
			'harpy' : 10000,
			'colonize_ship' : 10000
		};
	}
	else if (type == 'l')
	{
		l = {
			'attack_ship' : 5000
		};
	}
	else if (type == 'b')
	{
		l = {
			'bireme' : 5000
		};
	}
	else if (type == 'h')
	{
		l = {
			'hoplite' : 10000,
			'chariot' : 10000,
			'small_transporter' : 100,
			'attack_ship' : 40
		};
	}
	else if (type == 's')
	{
		l = {
			'slinger' : 5000,
			'small_transporter' : 100,
			'attack_ship' : 40
		};
	}
	else if (type == 'r')
	{
		l = {
			'rider' : 5000,
			'small_transporter' : 100,
			'attack_ship' : 40
		};
	}
	else if (type == 'g')
	{
		l = {
			'manticore' : 10000,
			'griffin' : 10000,
			'harpy' : 10000
		};
	}
	for (var id in l)
	{
		for (var i = start; i <= end; i++)
		{
			if (data.units[i].dep == null || !data.units[i].dep)
			{
				continue;
			}
			if (data.units[i].id == id && getUnitNumber(townInfo, id) < l[id])
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
	if (data.orders.docks.length < 4)
	{
		if (doTryRecruit(19, 26, data, type))
		{
			return;
		}
	}
	
	if (data.orders.barracks.length < 4)
	{
		if (doTryRecruit(0, 17, data, type))
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