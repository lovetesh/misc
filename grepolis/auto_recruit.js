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
	if (allowed >= 40 / population)
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