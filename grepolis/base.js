var frameWindow = window;
var gpAjax = window.gpAjax;

var createGame = function() {
	var frame = document.getElementById("game");
	if (frame)
		frame.remove();

	frame = document.createElement('iframe');
	frame.width = 1024;
	frame.height = 800;
	frame.id = "game";
	frame.frameborder = '0';
	frame.scrolling = 'no';
	frame.src = 'http://en80.grepolis.com';
	frame.sandbox = "allow-same-origin allow-scripts allow-forms";
	document.body.appendChild(frame);	

	var result = document.getElementById("game");
	frameWindow = frame.contentWindow;
	return result;
};

function myAjaxPost(type, action, params, cb, cb2)
{
	var callback =
	{
		success:function(_context,_data,_flag,_t_token)
		{
			cb(_data);
		},
		error:function(_context,_data,_t_token)
		{
			if (cb2)
			{
				cb2(_data);
			}
			console.log(_data);
		}
	}
	gpAjax.ajaxPost(type, action, params, false, callback);
}

function myAjaxGet(type, action, params, cb)
{
	var callback =
	{
		success:function(_context,_data,_flag,_t_token)
		{
			cb(_data);
		},
		error:function(_context,_data,_t_token)
		{
			console.log(_data);
		}
	}
	gpAjax.ajaxGet(type, action, params, false, callback);
}

function linkData()
{
	if (frameWindow.NotificationLoader.oldRecvData != null)
	{
		return;
	}
	gpAjax = frameWindow.gpAjax;
	frameWindow.NotificationLoader.oldRecvData = frameWindow.NotificationLoader.recvNotifyData;

	frameWindow.NotificationLoader.recvNotifyData = function(data, inited)
	{
		console.log(data);
		if (data.notifications != null)
		{
			for (var i = 0; i < data.notifications.length; i++)
			{
				handleNotification(data.notifications[i]);
			}
		}
		frameWindow.NotificationLoader.oldRecvData(data, inited);
	}
}

var botcheckAudio = new Audio('botcheck.mp3');
var attackAudio = new Audio('attack.wav');
var testAudio = new Audio('test.wav'); 

function handleNotification(n)
{
	if (n.type == frameWindow.NotificationType.INCOMING_ATTACK)
	{
//		attackAudio.play();
	}
	else if (n.type == frameWindow.NotificationType.BOTCHECK)
	{
		botcheckAudio.play();
	}
}