
var commander = require('commander');

commmander
	.version('1.0.0')
	.command('compare [fileOne] [fileTwo]', 'Compare the dependencies of two projects');
	
	

commander.parse(process.argv);