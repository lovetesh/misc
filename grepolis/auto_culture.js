var g_culture_data;
var g_tmp_content;

function doGetCultureInfoAndCulture(building_data)
{
	console.log("doGetCultureInfoAndCulture");
	myAjaxGet('town_overviews', 'culture_overview', {}, function(_data) {
		var content = _data.html;
		g_tmp_content = content;
		content = content.substr(content.indexOf("CultureOverview.init("));
		content = content.substr(0, content.indexOf(',{"triumph":14400,'));
		content = content.replace("CultureOverview.init(", "var culture_data = ");
		eval(content);
		g_culture_data = culture_data;
		startCulture(culture_data, 260);
	});
}

function startCulture(culture_data, id)
{
	if (culture_data[id] == null || culture_data[id].triumph == null)
	{
		doTriumph(id);
	}
	doCelebrationAll();
	cultureLoopEnded();
}

function doTriumph(id)
{
	var params = {
		"town_id":id,
		"celebration_type": "triumph",
		"no_bar":1
	}
    myAjaxPost('town_overviews', 'start_celebration', params, function(_data) {
		console.log(id + "start triumph");
	});
}

function doCelebrationAll()
{
	var params = {
		"town_id":frameWindow.ITowns.getCurrentTown().id,
		"celebration_type": "party"
	}
    myAjaxPost('town_overviews', 'start_all_celebrations', params, function(_data) {
		console.log("start all celebrations");
	})
}
