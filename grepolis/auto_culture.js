
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