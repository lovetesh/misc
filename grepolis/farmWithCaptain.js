
function sortByLootTime(a, b)
{
	if (a.island_x * a.island_y == b.island_x * b.island_y)
	{
		return a.lootTime - b.lootTime;
	}
	return a.island_x * a.island_y - b.island_x * b.island_y;
}

function captainSortFarmTown()
{
	if (alltowns == null)
	{
		return;
	}
	// sort towns by time.
	alltowns.sort(sortByLootTime);
}

function doRun()
{
	if (!global_start)
	{
		return;
	}
	setTimeout(dodoRun, getRequestIntervalTime());
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
			lootLoopEnded();
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
			alltowns[i].lootTime = 0;
		}
		doRun();
		});
}

function allowLoot(townId)
{
	var towndata = frameWindow.ITowns.towns[townId];
	var name = towndata.name;
	var typemap = {"0001": 'y',
				   "0002": 'y',
				   "0003": 'y',
				   "0004": 'y',
				   "0005": 'y',
				   "0006": 'y',
				   "0007": 'y',
				   "0008": 'y',
				   "0009": 'y',
				   "0010": 'y',
				   "0011": 'y',
				   '0012': 'y',
				   '0013': 'y',
				   '0014': 'y',
				   '0015': 'y',
				   '0016': 'y',
				   '0017': 'y',
				   '0018': 'y',
				   '0019': 'y',
				   '0020': 'y',
				   '0021': 'y',
				   '0022': 'y',
				   '0023': 'y',
				   '0024': 'y',
				   '0025': 'y',
				   '0026': 'y',
				   '0027': 'y',
				   '0028': 'y',
				   '0029': 'y',
				   '0030': 'y',
				   '00' : 'y',
	};
	var type = typemap[name.substr(0, 2)];
	if (type == null)
	{
		return false;
	}
	return true;
}

function doLootTown(cur_town_idx)
{
	console.log("doLootTown" + cur_town_idx);
	var towninfo = alltowns[cur_town_idx];
	var loot = false;
	var farm_town_list = towninfo.farm_town_list;
	var townlist = [];

	if (!allowLoot(towninfo.id))
	{
		console.log("Disable the loot town:" + towninfo.id);
		doRun();
		return;
	}

	for (var i = 0; i < farm_town_list.length; i++)
	{
		var farm_town = farm_town_list[i];
		if (farm_town.loot != null && farm_town.loot < (Date.now() / 1000))
		{
			townlist.push(farm_town.id);
		}
	}

	if (townlist.length == 0)
	{
		console.log("townlist is empty");
		doRun();
		return;
	}

	if (towninfo.loads_data[famingtime] == null)
	{
		console.log("current famingtime is not supported.");
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

	alltowns[cur_town_idx].lootTime = new Date().getTime();

	myAjaxPost('farm_town_overviews', 'claim_loads', params, function(_data) {
		console.log(_data);
		if (_data.error != null)
		{
			var towninfo = alltowns[cur_town_idx];
			//towninfo.valid = false;
		}
		doRun();},
		function(_data)
		{
			if (_data.claimed_resources_per_resource_type == 0)
			{
				var towninfo = alltowns[cur_town_idx];
			//	towninfo.valid = false;
				doRun();
			}
	});
}