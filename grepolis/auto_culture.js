
function doCuture()
{
	cultureLoopEnded();
}
/*
var buildTownIndex = 0;
var buildTownNum = 0;
var buildTowns = [];

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
http://en80.grepolis.com/game/town_overviews?town_id=165&action=start_celebration&h=81cb118366d
json:{"town_id":555,"celebration_type":"triumph","no_bar":1,"nlreq_id":50940188}
Request URL:http://en80.grepolis.com/game/town_overviews?town_id=165&action=start_all_celebrations&h=81cb118366d
json:{"celebration_type":"party","town_id":165,"nlreq_id":50966870} 165 is current.
*/

// Need add auto_cave and auto_trade

// auto_trade: For every city, if resource is too much. send to other city (1. culture needed city. 2. resource needed city.) 
// if need not culture(culture 1 hour away) and pop is not enough(< 200). And resource > base value(10000), send to other culture city.
// auto_cave: When the silver > 18000 and need not trade to other people. send 3000 silver in cave.
