
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

function tryBuildFromOverview(townId, building_data)
{
	var towndata = frameWindow.ITowns.towns[townId];
	if (towndata.name[0] == "n")
	{
		doBuildLoop(building_data);
		return;
	}
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
						'wall' : 1, 
						'barracks' : 10
					};
	if (buildOneFromList(townId, buildingList, building_data))
	{
		return true;
	}
	// medium
	buildingList = {'main' : 24,
						'farm' : 30, 
						'storage' : 23, 
						'academy' : 30, 
						'docks' : 20, 
						'market' : 10, 
						'temple' : 5, 
						'hide' : 10, 
						'wall' : 1, 
						'stoner' : 20, 
						'lumber' : 20,
						'ironer' : 20, 
						'barracks' : 10
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
						'hide' : 10, 
						'temple' : 15, 
						'wall' : 1, 
						'stoner' : 99,
						'lumber' : 99,
						'ironer' : 99, 
						'market' : 20,  
						'barracks' : 20
					};
	if (buildOneFromList(townId, buildingList, building_data))
	{
		return true;
	}
	buildingList = {'main' : 24,
						'farm' : 99, 
						'storage' : 99, 
						'academy' : 99, 
						'docks' : 99, 
						'hide' : 10, 
						'temple' : 99, 
						'wall' : 1, 
						'stoner' : 99,
						'lumber' : 99,
						'ironer' : 99, 
						'market' : 20,  
						'barracks' : 99
					};
	if (buildOneFromList(townId, buildingList, building_data))
	{
		return true;
	}
	doBuildLoop(building_data);
}

function buildOneFromList(townId, buildingList, building_data)
{
	var data = building_data[townId];
	var towndata = frameWindow.ITowns.towns[townId];
	if (frameWindow.ITowns.towns[townId].buildingOrders().length == 7)
	{
		return;
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
