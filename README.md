##Synopsis
Team wolfpack has been working very hard to develop a Node.js dependency tool
for Brady Corp. The tool is meant to help the development team at
Brady manage their Node modules with ease.

##Installation
Since the sdl-brady-dependency-tool is a tool that will compare entire Node projects, we recommend to install the sdl-brady-dependency-tool globally so that you can run it from any directory.

<pre><code>npm install -g sdl-brady-dependency-tool</code></pre>

If you don't wish to install the sdl-brady-dependency-tool globally, all you need to do is remove the '-g' from the command.

<pre><code>npm install sdl-brady-dependency-tool</code></pre>

##Examples

###Compare
If you want to compare the dependencies between two different Node projects, you will want to use the compare method. This will produce a table that will shows the path and version of each dependency in both projects, as well as match and compare them with the other project. All dependencies that are found in both projects appear at the top of the table while all dependencies that don't exist in both projects are listed toward the bottom of the table.

<pre><code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>"</code></pre>

The command above will look through the package.json file to find the list of dependencies before going through the node_modules package to get the current versions of each deendency. However, you may want to have both the list of dependencies and devDependencies being compared. In order to compare both, all you need to do is add the option "-a" or "--all".

<pre><code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" -a</code>

OR

<code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" --all</code></pre>

###Compare with Depth
Since Node dependencies have dependencies of their own, if you want to include the dependencies of other dependencies (especially if the node_module contains private dependencies), you can specify how many layers deep the comparison will look.

<pre><code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" -d 2</code>

OR

<code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" --depth 2</code></pre>

##Color Configuration
In order to color code the version number of each dependency to show any differences, the program looks at the colorConfig.json file. The program uses the [cli-color](https://www.npmjs.com/package/cli-color) node module in order to color the text in the terminal. If the terminal being used supports [xTerm colors](https://gist.github.com/jasonm23/2868981), then the colorConfig.json file can be 