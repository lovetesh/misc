function hasFreeBuildingSlots()
{
	return frameWindow.MM.collections.BuildingOrder[1].length < 7;
}


priorityList = ["buildHigh", "buildLow", "recruitHigh", "recruitLow"];
// buildHigh is to build important.
// buildLow is to use resources.
// recruitHigh is to use all resources but the recruit time must less than 4 hours.
// recruitLow is to use resources > half of current storage.
// send to balance resources.

// Every city need their own configs for buildings and recuitment.

// LS, Birs, Hoplite, slinger, horse, land defenses.

function doImportant()
{

}

function BuildOnce()
{

}

// first to build a list
// first recruit with half of resources.
// second build.
// startlist = ['resources', 'center', 'warehouse', 'academy', 'farm']

// List all want to do and give priority.
// 
