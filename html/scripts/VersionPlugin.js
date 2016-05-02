/**	
//interface to add the custom search plugins
interface Search{
	function addElements();
	function onFilter();
}

interface Layout(){
	var name;
	var layout = horizontal;
	var items[];
	
	//
	function Layout(name);
	function setLayout(style);
	//adds an item to the layout
	function addToLayout(Item);
}

//interface of creating custom search layouts
interface Items(){
	//name -> name to be displayed as a label next to the box or as a hint
	//hint -> boolean if true then the name is the hint
	//id -> javascript identifier
	//minChar -> minimum characters
	//maxChar -> maximum characters
	function Search(name, hint, id, minChar, maxChar);
	function Button();
	function Radio`();
	function CheckBox(type, label, labelPosition);
}
 */

//interfaces
var versionPlugin = new SearchPlugin(['addElements', 'onFilter']);
var versionLayout = new Layout("Versions", ['setLayout', 'addToLayout'])
	.setLayout("horizontal");

/* <div class="row">
	<div class="col-sm-3">
		<div class="checkbox">
			<label><input type="checkbox" value="" checked>Major</label>
		</div>
	</div>
	<div class="col-sm-3">
		<div class="checkbox">
			<label><input type="checkbox" value="" checked>Minor</label>
		</div>
	</div>
	<div class="col-sm-3">
		<div class="checkbox">
			<label><input type="checkbox" value="" checked>Patch</label>
		</div>
	</div>
	<div class="col-sm-3">
		<div class="checkbox">
			<label><input type="checkbox" value="" checked>Up To Date</label>
		</div>
	</div>
</div> */
function addElements(){
	var upToDateCheckbox = new CheckBox ("checkbox", "Major", 
		"right").addOuterClass("checkbox").addOuterClass("col-sm-3");
	layout.addToLayout(upToDateCheckbox);
	var patchCheckbox = new CheckBox ("checkbox", "Minor", "right")
		.addOuterClass("checkbox").addOuterClass("col-sm-3");
	layout.addToLayout(patchCheckbox);
	var minorCheckbox = new CheckBox ("checkbox", "Patch", "right")
		.addOuterClass("checkbox").addOuterClass("col-sm-3");
	layout.addToLayout(minorCheckbox);
	var majorCheckbox = new CheckBox ("checkbox", "Up To Date", 
		"right").addOuterClass("checkbox").addOuterClass("col-sm-3");
	versionLayout.addToLayout(majorCheckbox);
	versionPlugin.add(versions);
}

function onFilter(){
	function versioningShow(name){
		var length = document.getElementsByClassName(name).length;
		for(var i = 0; i < length; i++){
			document.getElementsByClassName(name)[i].
				parentNode.style="display: show";
		}
	}

	function versioningHide(name){
		var length = document.getElementsByClassName(name).length;
		for(var i = 0; i < length; i++){
			document.getElementsByClassName(name)[i].
				parentNode.style="display: none";
		}
	}
}