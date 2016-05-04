

function versioningShow(name){
	var length = document.getElementsByClassName(name).length;
	for(var i = 0; i < length; i++){
		document.getElementsByClassName(name)[i].parentNode.style="display: show";
	}
}

function versioningHide(name){
	var length = document.getElementsByClassName(name).length;
	for(var i = 0; i < length; i++){
		document.getElementsByClassName(name)[i].parentNode.style="display: none";
	}
}