var cliTable = require('cli-table2'),
    chalk = require('chalk');

/**
 * Creates a table based on the JSON objected passed in.
 * @param dependencies - JSON object that has the information as
 *     tableInfo = {
 *          project1 : {
 *              name : 'project1',
 *              path : 'path/to/project1',
 *              dependencies : [
 *                  {
 *                      name : name,
 *                      version : latest version
 *                      instances : [
 *                          {
 *                              version : version,
 *                              path : path
 *                          }, {...}
 *                      ]
 *                  }, {...}
 *              ]
 *           },
 *          project2 : {
 *              name : 'project2',
 *              path : 'path/to/project2',
 *              dependencies : []
 *          }
 *      }
 * @author Josh Leonard
 */
function createTable(tableInfo){
    if (tableInfo){
        var project1 = tableInfo.project1,
            project2 = tableInfo.project2;
        if (project1 && project2){
            var table = new cliTable({ //Creates the table object
                head: ['Module Name', project1.name, project1.path, project2.name, project2.path],
                style: {
                    head: [] //disable colors in header cells
                },
                wordWrap:true
            });

            var p1Dependencies = project1.dependencies,
                p2Dependencies = project2.dependencies;
                maxDependencies = Math.max(p1Dependencies.length, p2Dependencies.length);

            var i;
            for (i = 0; i < maxDependencies; i++){
                var p1Dependency = {
                    name : '',
                    instances : []
                }, p2Dependency = {
                    name : '',
                    instances : []
                };
                if (p1Dependencies[i]){
                    p1Dependency = p1Dependencies[i]
                }
                if (p2Dependencies[i]){
                    p2Dependency = p2Dependencies[i]
                }

                if (p1Dependency.name == p2Dependency.name){
                    var p1Instances = p1Dependency.instances,
                        p2Instances = p2Dependency.instances;
                    var name = p1Dependency.name;
                    var maxInstances = Math.max(p1Instances.length, p2Instances.length);
                    var count;
                    for (count = 0; count < maxInstances; count++){
                        var p1Instance = {
                                version : '',
                                path : ''
                        }, p2Instance = {
                                version : '',
                                path : ''
                        };
                        if (p1Instances[count]){
                            p1Instance = p1Instances[count]
                        }
                        if (p2Instances[count]){
                            p2Instance = p2Instances[count]
                        }
                        if (count == 0){
                            table.push([{rowSpan:maxInstances, content:name}, p1Instance.version, p1Instance.path, p2Instance.version, p2Instance.path]);
                        } else {
                            table.push([p1Instance.version, p1Instance.path, p2Instance.version, p2Instance.path]);
                        }
                    }
                } else {
                    var dependencies = [p1Dependency, p2Dependency];
                    var index;
                    for (index = 0; index < dependencies.length; index++){
                        var name = dependencies[index].name;
                        var instances = dependencies[index].instances;
                        var total = instances.length;
                        var count;
                        for (count = 0; count < total; count++){
                            var instance = {
                                version : '',
                                path : ''
                            };
                            if (instances[count]){
                                instance = instances[count]
                            }
                            if (index == 0){
                                if (count == 0){
                                    table.push([{rowSpan:total, content:name}, instance.version, instance.path, '', '']);
                                } else {
                                    table.push([instance.version, instance.path, '', '']);
                                }
                            } else {
                                if (count == 0){
                                    table.push([{rowSpan:total, content:name}, '', '', instance.version, instance.path]);
                                } else {
                                    table.push(['', '', instance.version, instance.path]);
                                }
                            }
                        }
                    }
                }
            }
            console.log(table.toString()); //prints the table
        } else {
            console.error('Projects are undefined.');
        }
    } else {
        console.error('No table data.');
    }
}

var tableInfo = {
    project1 : {
        name : 'project1',
        path : 'path/to/project1',
        dependencies : [{
            name : 'async',
            version : '1.0.0',
            instances : [{
                version : '1.0.0',
                path : 'path/to/dep'
            }]
        }, {
            name : 'mocha',
            version : '1.0.0',
            instances : [{
                version : '1.0.0',
                path : 'path/to/dep'
            }]
        }]
    },
    project2 : {
        name : 'project2',
        path : 'path/to/project2',
        dependencies : [{
            name : 'async',
            version : '1.0.0',
            instances : [{
                version : '1.0.0',
                path : 'path/to/dep'
            }, {
                version : '0.5.0',
                path : 'path/to/dep'
            }]
        }, {
            name : 'gulp',
            version : '1.0.0',
            instances : [{
                version : '1.0.0',
                path : 'path/to/dep'
            }, {
                version : '0.5.0',
                path : 'path/to/dep'
            }]
        }, {
            name : 'chai',
            version : '1.0.0',
            instances : [{
                version : '1.0.0',
                path : 'path/to/dep'
            }, {
                version : '0.5.0',
                path : 'path/to/dep'
            }]
        }

        ]
    }
}

createTable(tableInfo);