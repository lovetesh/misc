//(function(){
//window.doLogin = function() {
// var doLogin = function() {
// 	window.setTimeout(function() {
// 		//$("input[name='email']").val('xiaotenobu12@gmail.com');
// 		//$("input[name='password']").val('tzh20080426');
// 		document.getElementById('login').submit();
// 	}, 5000);
// 	//window.location = 'http://user.mobcast.jp/login?guid=ON&return_to=http%3A%2F%2Fmn.mobcast.jp%2Fmn%2F&sc=on';
// }
//})()

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

var common_delay = 5000;
var frame;

var start = function() {
	var game = createGame();
	frame = document.getElementById("game");
	window.setTimeout(function() {
		do_start();
 	}, common_delay);
};

var findID = function() {
	var frame = document.getElementById("game");
	if (frame == null)
	{
		return null;
	}
	var mainmenu = frame.contentDocument.getElementsByClassName("main-menu-top");
	if (mainmenu == null)
	{
		return null;
	}
	mainmenu = mainmenu[0];
	if (mainmenu == null)
	{
		return null;
	}
	var allitems = mainmenu.getElementsByTagName("a");
	if (allitems == null)
	{
		return null;
	}
	var a = allitems[1].href;
	return a.substr(a.lastIndexOf("%") + 1);
}

var quest = 1;
var shamo = 2;
var home = 3;
var dun = 4;
var sell = 5;

var getURL = function(type)
{
	if (type == home)
	{
		return "http://opf.mobcast.jp/1118?guid=ON";
	}
	var id = findID();
	if (id == null)
	{
		return null;
	}
	if (type == quest)
	{
		return "http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fev_quest%2Fq%2F_top.html%3Fu%" + findID();
	}
	else if (type == shamo)
	{
		return "http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fquest%2Farea_select.html%3Fidqd%3D10003%26u%" + findID();
	}
	else if (type == dun)
	{
		return "http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fev_quest%2Fq%2F_top.html%3Fidqr%3D10002%26dStep%3D4%26isd%3D%26u%" + findID();
	}
	else if (type == sell)
	{
		return "http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fequip%2Fsell.html%3Fu%" + findID();
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
	var frame = document.getElementById("game");
	frame.contentWindow.location = url;
	return true;
}

var canStart = false;

var do_start = function()
{
	canStart = true;
	do_go_quest();
}

var mylog = function(content)
{
	window.console.log(Date() + ": " + content);
}

var do_go_quest = function()
{
	if (!canStart)
	{
		return;
	}
	if (!gotoURL(shamo))
		{
			mylog("N: failed, so do_go_quest again after 15 secs.");
			gotoURL(home);
			window.setTimeout(function() {
			do_go_quest();
	 	}, 15000);
		return;
	}
	window.setTimeout(function() {
		do_start_shamo();
 	}, common_delay);
 	mylog("1: do_go_quest");
}

/*
var do_go_shamo = function()
{
	if (!canStart)
	{
		return;
	}
	gotoURL(shamo);
	window.setTimeout(function() {
		do_start_shamo();
 	}, common_delay);
}
*/

var do_submit_shamo_form = function()
{
	var bg = frame.contentDocument.getElementsByClassName("sky-bg");
	if (bg == null)
	{
		return false;
	}
	bg = bg[0];
	if (bg == null)
	{
		return false;
	}
	var form = bg.getElementsByTagName("form")[0];
	if (form == null)
	{
		return false;
	}
	form.submit();
	mylog("2: do_submit_shamo_form");
	return true;
}

var do_start_shamo = function()
{
	if (!canStart)
	{
		return;
	}
	do_submit_shamo_form();
	window.setTimeout(function() {
		do_start_shamo2();
 	}, common_delay);
 	mylog("3: do_start_shamo");
}

var do_start_shamo2 = function()
{
	if (!canStart)
	{
		return;
	}
	var delayed = 60000;
	if (!do_submit_shamo_form())
	{
		delayed -= common_delay;
	}
	window.setTimeout(function() {
		do_finish_shamo();
 	}, delayed);
 	mylog("3.5: do_start_shamo2");
}

var do_finish_shamo = function()
{
	if (!canStart)
	{
		return;
	}
	gotoURL(quest);
	window.setTimeout(function() {
		do_finish_shamo2();
 	}, common_delay);
 	mylog("4: do_finish_shamo");
}

var do_finish_shamo2 = function()
{
	if (!canStart)
	{
		return;
	}
	gotoURL(home);
	window.setTimeout(function() {
		battleCounter++;
		if (battleCounter > 12)
		{
			do_try_sell();
		}
		else
		{
			do_go_quest();
		}
 	}, common_delay);
 	mylog("5: do_finish_shamo2");
}

var do_stop = function()
{
	canStart = false;
	mylog("do_stop");
}

var battleCounter = 0;

var do_try_sell = function()
{
	gotoURL(sell);
	window.setTimeout(function() {
		do_sell1();
 	}, common_delay);
 	mylog("do_try_sell");
}

var do_submit_sell1 = function()
{
	var bg = frame.contentDocument.getElementsByClassName("paper-window-small");
	if (bg == null)
	{
		return;
	}
	bg = bg[0];
	var form = bg.getElementsByTagName("form")[0];
	form.submit();
	mylog("do_submit_sell1");
}

var do_sell1 = function()
{
	do_submit_sell1();
	window.setTimeout(function() {
		do_sell2();
 	}, common_delay);
 	mylog("do_sell1");
}

var do_submit_sell2 = function()
{
	var bg = frame.contentDocument.getElementsByClassName("paper-window-small");
	if (bg == null)
	{
		return;
	}
	bg = bg[0];
	var form = bg.getElementsByTagName("form")[0];
	form.submit();
	mylog("do_submit_sell2");
}

var do_sell2 = function()
{
	do_submit_sell2();
	window.setTimeout(function() {
		battleCounter = 0;
		do_go_quest();
 	}, common_delay);
 	mylog("do_sell2");
}

/*
1. Go area_select
2. Summit adventure form.
3. Click adventure page.
Loop it.
*/

/*
1. Go sale page
2. summit page.

*/

/*
http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2FquestPlay%2Fquest.html%3Fu%3Db5952b731ccf60ca6bc217bf831a90a7
http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fquest%2Farea_select.html%3Fidqd%3D10003%26u%3D9f38c77f86ee6322e02a031aac242c82
http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fquest%2Farea_select.html%3Fidqd%3D10003%26u%3Db5952b731ccf60ca6bc217bf831a90a7
http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fev_quest%2Fq%2F_top.html%3Fu%3Db5952b731ccf60ca6bc217bf831a90a7
http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fev_quest%2Fq%2Farea_select.html%3Fidqd%3D20016%26isd%3D%26u%3Db5952b731ccf60ca6bc217bf831a90a7
http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fquest%2Farea_select.html%3Fidqd%3D10003%26u%3Db5952b731ccf60ca6bc217bf831a90a7
http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fquest%2F_top.html%3Fidqr%3D10001%26u%3Db5952b731ccf60ca6bc217bf831a90a7
http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fev_quest%2Fq%2F_top.html%3Fu%3Db5952b731ccf60ca6bc217bf831a90a7
http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fev_quest%2Fq%2F_top.html%3Fu%3D9f38c77f86ee6322e02a031aac242c82
http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fev_quest%2Fq%2F_top.html%3Fidqr%3D10002%26dStep%3D5%26isd%3D%26u%3D195956e93a9a7d070cd40a0fd65e331a
http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fev_quest%2Fq%2F_top.html%3Fidqr%3D10002%26dStep%3D6%26isd%3D%26u%3D195956e93a9a7d070cd40a0fd65e331a
http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fev_quest%2Fq%2F_top.html%3Fidqr%3D10002%26dStep%3D4%26isd%3D%26u%3D195956e93a9a7d070cd40a0fd65e331a
http://opf.mobcast.jp/1118?guid=ON&url=http%3A%2F%2Faadvg.pocket-idea.jp%2Faadv_mobcast%2Fev_quest%2Fq%2F_top.html%3Fidqr%3D10002%26dStep%3C4%26isd%3D%26u%3D195956e93a9a7d070cd40a0fd65e331a
%3Fidqd%3D10003%26u%3Db5952b731ccf60ca6bc217bf831a90a7"
%3Fidqd%3D10003%26u%3Db5952b731ccf60ca6bc217bf831a90a7
%3Fidqd%3D20016%26isd%3D%26u%3Db5952b731ccf60ca6bc217bf831a90a7
       %3Fu%3D3405eb2c220asdfasdf38bd02f9cf4f2481b711e"

%3Fidqd%3D20016%26isd%3D%26u%
%3Fidqd%3D10003%         26u%
*/