[![Build Status](https://travis-ci.org/TeamWolfpack/Dependency-Comparator.svg)](https://travis-ci.org/TeamWolfpack/Dependency-Comparator)
[![Dependency Status](https://david-dm.org/TeamWolfpack/Dependency-Comparator.svg)](https://david-dm.org/TeamWolfpack/Dependency-Comparator)

<p>
<img src="https://raw.githubusercontent.com/TeamWolfpack/Dependency-Comparator/dev/screenshots/guigif.gif" atl="Failed to load juicy demo">
</p>

##Synopsis
<p>The dependency-comparator is designed by developers for developers. Maintaining node dependencies can be a pain, so we have made this to help analyze out-dated dependencies.</p>

##Installation
Since the dependency-comparator is a tool that will compare entire Node projects, we recommend to install the dependency-comparator globally so that you can run it from any directory.

<pre><code>npm install -g dependency-comparator</code></pre>

If you don't wish to install the dependency-comparator globally, all you need to do is remove the '-g' from the command.

<pre><code>npm install dependency-comparator</code></pre>

##Compare

<img src="https://raw.githubusercontent.com/TeamWolfpack/Dependency-Comparator/dev/screenshots/Compare.JPG" atl="Failed to load screenshot of Compare Command">
<p>Use the compare method to compare the dependencies between one or more Node projects. Projects can be entered as relative or absolute paths. The command will produce a table that will shows the path and version of each dependency in all projects, matching them with the other projects. Dependencies found in all projects appear at the top of the table while dependencies that only exist in some projects are listed toward the bottom of the table. In addition, a logfile is stored in the directory where the program is saved by npm (by default in the global npm modules folder under dependency-comparator). This logfile contains a json representation of the information about the comparison.</p>

<pre><code>dep-tool compare "[project_path]"</code></pre>

or

<pre><code>dep-tool cmp "[project_path]"</code></pre>

<details>
  <summary>More on Compare...</summary>
    
  <h3 id="devDependencies">Compare with devDependencies</h3>
  The command above will look through the package.json file to find the list of dependencies before going through the node_modules package to get the current versions of each dependency. However, you may want to have both the list of dependencies and devDependencies being compared. In order to compare both, all you need to do is add the option "-a" or "--all".
    
  <pre><code>dep-tool compare "[project_path]" -a</code></pre>
    
  or
    
  <pre><code>dep-tool compare "[project_path]" --all</code></pre>
    
  <h3 id="CompareDepth">Compare with Depth</h3>
  Since Node dependencies have dependencies of their own, if you want to include the dependencies of other dependencies (especially if the node_module contains private dependencies), you can specify how many layers deep the comparison will look.
    
  <pre><code>dep-tool compare "[project_path]" -d 2</code></pre>
    
  or
    
  <pre><code>dep-tool compare "[project_path]" --depth 2</code></pre>
    
  <h3 id="HideUnmatched">Compare without Unmatched Dependencies</h3>
  <img src="https://raw.githubusercontent.com/TeamWolfpack/Dependency-Comparator/dev/screenshots/Unhide%20Compare.JPG" alt="Failed to load screenshot Unhide Unmatched">
  <p>becomes</p>
  <img src="https://raw.githubusercontent.com/TeamWolfpack/Dependency-Comparator/dev/screenshots/Hide%20Compare.JPG" alt="Failed to load screenshot Hide Unmatched">
  <p>By default, the compare method will compare and match all dependencies. If you want to only see the matched dependencies, you can hide the unmatched dependencies with a simple flag.</p>
    
  <pre><code>dep-tool compare "[project_path]" -u</code></pre>
    
  or
    
  <pre><code>dep-tool compare "[project_path]" --hideUnmatched</code></pre>
</details>

<h2 id="DependencyTable">Dependency Table</h2>
<img src="https://raw.githubusercontent.com/TeamWolfpack/Dependency-Comparator/dev/screenshots/Dependency%20Table.JPG" alt="Failed to load screenshot Dependecy Table">
The Dependency Table allows the user to view all dependencies of the provided project(s). It is served on a web page via a built in web server that will close when the page is closed. It allows for user interaction. If the user hovers over a path cell then a tooltip will display extra information about that dependency.

<h2 id="Filtering">Filtering</h2>
<img src="https://raw.githubusercontent.com/TeamWolfpack/Dependency-Comparator/dev/screenshots/filter.PNG" alt="Failed to load screenshot Relative Support">
In the web page, there is the ability to filter the contents of the table. The filters include: project names, dependency names, versions, and unmatched dependencies.
**NOTE:** Multiple projects and dependencies can be entered by separating them with a semicolon and space.

<details>
  <summary>Information specific to CLI use...</summary>

  <h3 id="CompareColorConfig">Compare Color Configuration</h3>
  Since the default color scheme for identifying how out-of-date a dependency is consists of red and green, a common colorblind color pair, we added a Color Blind color configuration to help solve that. These color schemes can be changed and this is explain more in the <a href="#ColorConfig">Color Configuration</a> section. <b>NOTE:</b> In order to use this option, xTerm needs to be supported in your OS.

  <pre><code>dep-tool compare "[project_path]" -c "ColorBlind"</code></pre>

  or

  <pre><code>dep-tool compare "[project_path]" --colorConfig "ColorBlind"</code></pre>

  <h3 id="ColorLegend">Compare with a Color Legend</h3>
  <img src="https://raw.githubusercontent.com/TeamWolfpack/Dependency-Comparator/dev/screenshots/Color%20Legend.JPG" alt="Failed to load screenshot of Color Legend Command">
  <p>When running the compare method, the dependencies in the table are colored depending on how out-of-date they are. If you want to see a color legend, you just need to add a flag to the command to have it displayed below your table.</p>

  <pre><code>dep-tool compare "[project_path]" -l</code></pre>

  or

  <pre><code>dep-tool compare "[project_path]" --colorLegend</code></pre>

  <h3 id="SummaryTable">Compare without a Summary Table</h3>
  <p>By default, a summary of the results will be displayed below the comparison table. If you want to hide the summary from being displayed, you can add the following flag to your command.</p>

  <pre><code>dep-tool compare "[project_path]" -s</code></pre>

  or

  <pre><code>dep-tool compare "[project_path]" --hideSummary</code></pre>

  <h3 id="Summary">Summary</h3>
  <img src="https://raw.githubusercontent.com/TeamWolfpack/Dependency-Comparator/dev/screenshots/Summary.JPG" alt="Failed to load screenshot of Summary Command">
  <p>By default, a summary of the results will be displayed below the comparison table. If you want to hide the summary from being displayed, you can add the following flag to your command. The <a href="#CompareDepth">depth</a>, <a href="#devDependencies">all</a>, and <a href="#HideUnmatched">hideUnmatched</a> flags can also be used with the summary command.</p>

  <pre><code>dep-tool summary "[project_path]"</code></pre>

  or

  <pre><code>dep-tool sum "[project_path]"</code></pre>

  <h3 id="SummaryWithTable">Summary With Table</h3>
  <p>In case you are using the summary command and realize you want to see a table, instead of having to retype a new command, you can just use the showTable flag.</p>

  <pre><code>dep-tool summary "[project_path]" -t</code></pre>

  or

  <pre><code>dep-tool summary "[project_path]" --showTable</code></pre>

  <h2 id="ColorConfig">Color Configuration</h2>
  In order to color code the version number of each dependency to show any differences, the program looks at the colorConfig.json file. The program uses the [cli-color](https://www.npmjs.com/package/cli-color) node module in order to color the text in the terminal. If the terminal being used supports [xTerm colors](https://gist.github.com/jasonm23/2868981), then the colorConfig.json file can be modified to the users preference. <b>NOTE:</b> When updating to a newer version of the tool, the colorConfig.json file may be reset to the default values.

</details>