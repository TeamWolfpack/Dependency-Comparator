/*
 * Command line application that compares the dependency versions of two projects
 */

var commander = require('commander');

function compare(fileOne, fileTwo){
	//Method Stub for main compare method
}




//Commander lines go below this comment
//All commands need a command, description, alias, and action component

commander
	.version('1.0.0');

commander
	.command('compare [fileOne] [fileTwo]')
		.description('Compare the dependencies of two projects')
		.alias("cmp")
		.action(compare);
	

commander.parse(process.argv);