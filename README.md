##Synopsis
<p>The sdl-brady-dependency-tool is designed by developers for developers. Maintaining node dependencies can be a pain, so we have made this to help analyze out-dated dependencies.</p>

##Installation
Since the sdl-brady-dependency-tool is a tool that will compare entire Node projects, we recommend to install the sdl-brady-dependency-tool globally so that you can run it from any directory.

<pre><code>npm install -g sdl-brady-dependency-tool</code></pre>

If you don't wish to install the sdl-brady-dependency-tool globally, all you need to do is remove the '-g' from the command.

<pre><code>npm install sdl-brady-dependency-tool</code></pre>

##Examples

<h3 id="Compare">Compare</h3>
If you want to compare the dependencies between two different Node projects, you will want to use the compare method. This will produce a table that will shows the path and version of each dependency in both projects, as well as match and compare them with the other project. All dependencies that are found in both projects appear at the top of the table while all dependencies that don't exist in both projects are listed toward the bottom of the table.

<pre><code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>"</code>

OR

<code>brady-tool cmp "&lt;project1_path>" "&lt;project2_path>"</code></pre>

<h3 id="devDependencies">Compare with devDependencies</h3>
The command above will look through the package.json file to find the list of dependencies before going through the node_modules package to get the current versions of each dependency. However, you may want to have both the list of dependencies and devDependencies being compared. In order to compare both, all you need to do is add the option "-a" or "--all".

<pre><code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" -a</code>

OR

<code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" --all</code></pre>

<h3 id="CompareDepth">Compare with Depth</h3>
Since Node dependencies have dependencies of their own, if you want to include the dependencies of other dependencies (especially if the node_module contains private dependencies), you can specify how many layers deep the comparison will look.

<pre><code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" -d 2</code>

OR

<code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" --depth 2</code></pre>

<h3 id="HideUnmatched">Compare without Unmatched Dependencies</h3>
<p>By default, the compare method will compare and match all dependencies. If you want to only see the matched dependencies, you can hide the unmatched dependencies with a simple flag.</p>

<pre><code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" -u</code>

OR

<code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" --hideUnmatched</code></pre>

<h3 id="CompareColorConfig">Compare Color Configuration</h3>
Since the default color scheme for identifying how out-of-date a dependency is consists of red and green, a common colorblind color pair, we added a Color Blind color configuration to help solve that. These color schemes can be changed and this is explain more in the <a href="#ColorConfig">Color Configuration</a> section. <b>NOTE:</b> In order to use this option, xTerm needs to be supported in your OS.

<pre><code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" -c "ColorBlind"</code>

OR

<code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" --colorConfig "ColorBlind"</code></pre>

<h3 id="ColorLegend">Compare with a Color Legend</h3>
When running the compare method, the dependencies in the table are colored depending on how out-of-date they are. If you want to see a color legend, you just need to add a flag to the command to have it displayed below your table.

<pre><code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" -l</code>

OR

<code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" --colorLegend</code></pre>

<h3 id="SummaryTable">Compare without a Summary Table</h3>
<p>By default, a summary of the results will be displayed below the comparison table. If you want to hide the summary from being displayed, you can add the following flag to your command.</p>

<pre><code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" -s</code>

OR

<code>brady-tool compare "&lt;project1_path>" "&lt;project2_path>" --hideSummary</code></pre>

<h3 id="Summary">Summary</h3>
<p>By default, a summary of the results will be displayed below the comparison table. If you want to hide the summary from being displayed, you can add the following flag to your command. The <a href="#CompareDepth">depth</a>, <a href="#devDependencies">all</a>, and <a href="#HideUnmatched">hideUnmatched</a> flags can also be used with the summary command.</p>

<pre><code>brady-tool summary "&lt;project1_path>" "&lt;project2_path>"</code>

OR

<code>brady-tool sum "&lt;project1_path>" "&lt;project2_path>"</code></pre>

<h3 id="SummaryWithTable">Summary With Table</h3>
<p>In case you are using the summary command and realize you want to see a table, instead of having to retype a new command, you can just use the showTable flag.</p>

<pre><code>brady-tool summary "&lt;project1_path>" "&lt;project2_path>" -t</code>

OR

<code>brady-tool summary "&lt;project1_path>" "&lt;project2_path>" --showTable</code></pre>

<h2 id="ColorConfig">Color Configuration</h2>
In order to color code the version number of each dependency to show any differences, the program looks at the colorConfig.json file. The program uses the [cli-color](https://www.npmjs.com/package/cli-color) node module in order to color the text in the terminal. If the terminal being used supports [xTerm colors](https://gist.github.com/jasonm23/2868981), then the colorConfig.json file can be modified to the users preference. <b>NOTE:</b> When updating to a newer version of the tool, the colorConfig.json file may be reset to the default values.