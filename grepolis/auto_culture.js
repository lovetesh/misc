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
		startCulture(culture_data);
	});
}

function startCulture(culture_data)
{
	if (culture_data[260] == null || culture_data[260].triumph == null)
	{
		doTriumph(260);
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
		console.log(id + "start all celebrations");
	})
}
