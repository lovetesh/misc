var createGame = function() {
	var frame = document.getElementById("game");
	if (frame)
		frame.remove();

	frame = document.createElement('iframe');
	frame.id = "game";
//	frame.width = 300;
//	frame.height = 450;
	frame.frameborder = '0';
	frame.scrolling = 'no';
	frame.src = 'http://opf.mobcast.jp/1118?guid=ON'
	document.body.appendChild(frame);	

	var result = document.getElementById("game");
	return result;
};

var start = function() {
	var game = createGame();
	frame = document.getElementById("game");
	window.setInterval(do_loop, 1000);
	createAttackList();
	createSellList();
	createUpgradeList();
	restart();
};

var restart = function()
{
	startList(attack_list);
	pause = false;
}

var stop = function()
{
	pause = true;
}

var common_delay = 5000;
var frame;
var pause = false;

var curRunIndex;
var curRunList;
var attack_list;
var sell_list;
var upgrade_list;

var curTime = 0;
var needRunTime = -1;

var need_forge = false;

var startList = function(list)
{
	curRunList = list;
	curRunIndex = -1;
}

var do_loop = function()
{
	curTime += 1000;	
	if (pause)
	{
		return;
	}
	if (curRunIndex < 0)
	{
		curRunIndex = 0;
	}
	if (curTime >= needRunTime)
	{
		if (curRunIndex < curRunList.length)
		{
			try
			{
				mylog("run f, curRunIndex = " + curRunIndex);
				needRunTime = curTime + curRunList[curRunIndex].t;
				curRunList[curRunIndex].f();
				curRunIndex++;
			}
			catch (err)
			{
				needRunTime = curTime + 10000;
				gotoURL(home);
				startList(attack_list);
				mylog(err);
			}
		}
		else
		{
			mylog("invalid list, not loop.");
		}
	}
}

var addCommand = function(list, f, t)
{
	var obj = new Object();
	obj.f = f;
	obj.t = t;
	list[list.length] = obj;
}

var findID = function() {
	var frame = document.getElementById("game");
	var mainmenu = frame.contentDocument.getElementsByClassName("main-menu-top");
	mainmenu = mainmenu[0];
	var allitems = mainmenu.getElementsByTagName("a");
	var a = allitems[1].href;
	return a.substr(a.lastIndexOf("%") + 1);
}

var quest = 1;
var shamo = 2;
var home = 3;
var dun = 4;
var sell = 5;
var forge = 6;
var askhelp = 7;
var helpother = 8;

var shamo_special = "3Fidqd%3D10003%26u%";
var shamo_delay = 60000;
// for 10 minutes adventure.
shamo_delay = shamo_delay * 70;

var getURL = function(type)
{
	if (type == home)
	{
		return "http://opf.mobcast.jp/1118?guid=ON";
	}
	var id = findID();
	if (type == quest)
	{
		return "http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fev_quest%2Fq%2F_top.html%3Fu%" + findID();
	}
	else if (type == shamo)
	{
		return "http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fquest%2Farea_select.html%" + shamo_special + findID();
	}
	else if (type == dun)
	{
		return "http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fev_quest%2Fq%2F_top.html%3Fidqr%3D10002%26dStep%3D4%26isd%3D%26u%" + findID();
	}
	else if (type == sell)
	{
		return "http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fequip%2Fsell.html%3Fu%" + findID();
	}
	else if (type == forge)
	{
		return "http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fcompo%2Fcompo.html%3Fu%" + findID();
	}
	else if (type == helpother)
	{
		return "http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2FquestPlay%2Fhelp_request.html%3Fu%" + findID();
	}
	else if (type == askhelp)
	{
		return "http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2FquestPlay%2Frequest.html%3Fu%" + findID();
	}
	return null;
}

var gotoURL = function(type)
{
	var url = getURL(type);
	if (url == null)
	{
		return false;
	}
	gotoRealURL(url);
	return true;
}

var gotoRealURL = function(url)
{
	var frame = document.getElementById("game");
	frame.contentWindow.location = url;
}

var mylog = function(content)
{
	window.console.log(Date() + ": " + content);
}

var createAttackList = function()
{
	attack_list = new Array();
	addCommand(attack_list, do_go_quest, common_delay);
	addCommand(attack_list, do_go_quest2, common_delay);
	addCommand(attack_list, do_submit_shamo_form, common_delay);
	addCommand(attack_list, do_start_shamo2, common_delay * 2);
	addCommand(attack_list, do_ask_help, common_delay);
	addCommand(attack_list, do_ask_help_confirm, shamo_delay - 2 * common_delay);
	addCommand(attack_list, do_finish_shamo, common_delay);
	addCommand(attack_list, do_finish_shamo2, 0);
	addCommand(attack_list, do_complete_attack, common_delay);
}

var do_ask_help = function()
{
	if (shamo_delay > 60000 * 9)
	{
		gotoURL(askhelp);
	}
}

var do_ask_help_confirm = function()
{
	if (shamo_delay > 60000 * 9)
	{
		// try to find form and ask.
		var bg = frame.contentDocument.getElementsByClassName("paper-window-small");
		bg = bg[0];
		var form = bg.getElementsByTagName("form")[0];
		if (form != null)
		{
			form.submit();
		}
	}
}

var findQuestUrl = function()
{
	var bg = frame.contentDocument.getElementsByClassName("paper-window-small");
	bg = bg[0];
	bg = bg.getElementsByTagName("a");
	return bg[0].href;
}

var findQuestPlayUrl = function() {
	var frame = document.getElementById("game");
	var mainmenu = frame.contentDocument.getElementsByClassName("main-menu-top");
	mainmenu = mainmenu[0];
	var allitems = mainmenu.getElementsByTagName("a");
	var a = allitems[1].href;
	return a;
}

var do_go_quest = function()
{
	if (true)
	{
		//gotoURL(quest);
		gotoRealURL(findQuestPlayUrl());
	}
	else
	{
		gotoURL(shamo);
	}
 	mylog("1: do_go_quest");
}

var do_go_quest2 = function()
{
	gotoRealURL(findQuestUrl());
	mylog("2: do_go_quest2");
}

var do_submit_shamo_form = function()
{
	var bg = frame.contentDocument.getElementsByClassName("sky-bg");
	bg = bg[0];
	var form = bg.getElementsByTagName("form")[0];
	form.submit();
	mylog("2: do_submit_shamo_form");
	return true;
}

var do_start_shamo2 = function()
{
	try
	{
		do_submit_shamo_form();
	}
	catch (err)
	{
		mylog("do_start_shamo2 failed");
		needRunTime -= common_delay;
	}
 	mylog("3.5: do_start_shamo2");
}

var do_finish_shamo = function()
{
	gotoURL(quest);
 	mylog("4: do_finish_shamo");
}

var do_finish_shamo2 = function()
{
	gotoURL(home);
 	mylog("5: do_finish_shamo2");
}

var do_complete_attack = function()
{
	battleCounter++;
	var nextlist = attack_list;
	if (battleCounter > 3)
	{
		if (need_forge)
		{
			nextlist = upgrade_list;
		}
		else
		{
			nextlist = sell_list;
		}
	}
	startList(nextlist);
}

var battleCounter = 0;

var createSellList = function()
{
	sell_list = new Array()
	addCommand(sell_list, do_try_sell, common_delay);
	addCommand(sell_list, do_submit_sell1, common_delay);
	addCommand(sell_list, do_submit_sell2, 0);
	addCommand(sell_list, do_complete_sell, common_delay);
	return sell_list;
}

var do_try_sell = function()
{
	gotoURL(sell);
 	mylog("do_try_sell");
}

var do_submit_sell1 = function()
{
	var bg = frame.contentDocument.getElementsByClassName("paper-window-small");
	bg = bg[0];
	var form = bg.getElementsByTagName("form")[0];
	form.submit();
	mylog("do_submit_sell1");
}

var do_submit_sell2 = function()
{
	try 
	{
		do_submit_sell1();
	}
	catch (err)
	{

	}
	mylog("do_submit_sell2");
}

var do_complete_sell = function()
{
	battleCounter = 0;
	startList(attack_list);
}

var createUpgradeList = function()
{
	upgrade_list = new Array();
	addCommand(upgrade_list, do_try_forge, common_delay);
	addCommand(upgrade_list, do_submit_forge1, common_delay);
	addCommand(upgrade_list, do_submit_forge2, common_delay);
	addCommand(upgrade_list, do_finish_forge, 0);
	addCommand(upgrade_list, do_complete_forge, common_delay);
	return upgrade_list;
}

var do_try_forge = function()
{
	gotoURL(forge);
	mylog("do_try_forge");
}

var do_submit_forge1 = function()
{
	var bg = frame.contentDocument.getElementsByClassName("wood-board");
	bg = bg[0];
	var form = bg.getElementsByTagName("form")[0];
	form.submit();
	mylog("do_submit_forge1");
}

var do_submit_forge2 = function()
{
	try
	{
		do_submit_forge1();
	}
	catch (err)
	{

	}
	mylog("do_submit_forge2");
}

var do_finish_forge = function()
{
	gotoURL(home);
}

var do_complete_forge = function()
{
	startList(sell_list);
}

