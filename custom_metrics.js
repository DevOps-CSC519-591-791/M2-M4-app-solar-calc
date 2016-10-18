var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var fs = require("fs");
var exec = require('child_process').exec;
var maxConditions = 0;
var numOfIfStatement = 0;
var numOfLoops = 0;

function main()
{
	var args = process.argv.slice(2);

	if( args.length == 0 )
	{
		args = ["src/solarCalc.js"];
	}
	var filePath = args[0];
	complexity(filePath);

	// Report
	for( var node in builders )
	{
		var builder = builders[node];
		builder.report();
	}

	console.log("=====Duplicated Code Detection====================");
	var cmd = "jsinspect -t 30 -i ./src";
	exec(cmd, function(error, stdout, stderr) {
	  // command output is in stdout
	  console.log(stdout);
	});
}

var builders = {};

// Represent a reusable "class" following the Builder pattern.
function ComplexityBuilder()
{
	this.StartLine = 0;
	this.EndLine = 0;
	this.FunctionName = "";
	// Count the max number of conditions within an if statement in a function
	this.MaxConditions = 0;
	// Method includes more than 100 LOC
	this.LongMethod = false;
	// Number of if statements/loops + 1
	this.SimpleCyclomaticComplexity = 0;
	// The max depth of scopes (nested ifs, loops, etc)
	this.DuplicateCode = "";
	
	this.report = function()
	{
		console.log(
		   (
		   	"{0}(): {1}\n" +
		   	"============\n" +
			   "MaxConditions: {2}\t" +
			   "LongMethod: {3}\t" +
			   "SimpleCyclomaticComplexity: {4}\t" +
			   "DuplicateCode: {5}\n\n"
			)
			.format(this.FunctionName, this.StartLine,
				    this.MaxConditions, this.LongMethod,
				    this.SimpleCyclomaticComplexity, this.DuplicateCode)
		);
	}
};

// A function following the Visitor pattern. Provide current node to visit and function that is evaluated at each node.
function traverse(object, visitor) 
{
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

// A function following the Visitor pattern.
// Annotates nodes with parent objects (add each node's parent info into node, see output_with_parent_info.txt)
function traverseWithParents(object, visitor)
{
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent') 
            {
            	child.parent = object;
				traverseWithParents(child, visitor);
            }
        }
    }
}


// A function following the Visitor pattern but allows canceling transversal if visitor returns false.
function traverseWithCancel(object, visitor)
{
    var key, child;

    if( visitor.call(null, object) )
    {
	    for (key in object) {
	        if (object.hasOwnProperty(key)) {
	            child = object[key];
	            if (typeof child === 'object' && child !== null) {
	                traverseWithCancel(child, visitor);
	            }
	        }
	    }
 	 }
}

function complexity(filePath)
{
	var buf = fs.readFileSync(filePath, "utf8");
	var ast = esprima.parse(buf, options);
	var i = 0;
	// Traverse program with a function visitor.
	traverseWithParents(ast, function (node) 
	{
		var builder = new ComplexityBuilder();
		if (node.type === 'FunctionDeclaration' || node.type === 'MethodDefinition') 
		{
			builder.FunctionName = functionName(node, node.type);
			builder.StartLine    = node.loc.start.line;
			builder.EndLine 	 = node.loc.end.line;
			var lineNum = builder.EndLine - builder.StartLine + 1;
			if(lineNum >= 20){
				builder.LongMethod = true;
			}

			traverseWithParents(node, function(child){
				if(isIfStatement(child)){
					numOfIfStatement++;
				}
				if(isLoop(child)){
					numOfLoops++;
				}
				if(child.type === "IfStatement"){
					maxConditions++;
					traverseWithParents(child, function(grandchild){
						if(grandchild.operator === "&&" || grandchild.operator === "||"){
							maxConditions++;
						}
					});
				}
				if(maxConditions > builder.MaxConditions){
					builder.MaxConditions = maxConditions;
				}
				maxConditions = 0;
			});

			// avoid dividing by 0
			if(numOfLoops === 0){
				numOfLoops = 1;
			}
			builder.SimpleCyclomaticComplexity = numOfIfStatement / numOfLoops + 1;
			numOfIfStatement = 0;
			numOfLoops = 0;

			
		}
			//maxConditions++; // # of condition is 1 more than # of operator
		builders[builder.FunctionName] = builder;
	});

}

// Helper function for counting children of node.
function childrenLength(node)
{
	var key, child;
	var count = 0;
	for (key in node) 
	{
		if (node.hasOwnProperty(key)) 
		{
			child = node[key];
			if (typeof child === 'object' && child !== null && key != 'parent') 
			{
				count++;
			}
		}
	}	
	return count;
}

function isIfStatement(node)
{
	if( node.type == 'IfStatement' )
	{
		// Don't double count else/else if
		if( node.parent && node.parent.type == 'IfStatement' && node.parent["alternate"] )
		{
			return false;
		}
		return true;
	}
	return false;
}

function isLoop(node)
{
	if( node.type == 'ForStatement' || node.type == 'WhileStatement' ||
		 node.type == 'ForInStatement' || node.type == 'DoWhileStatement')
	{
		return true;
	}
	return false;
}

// Helper function for printing out function name.
function functionName( node, type )
{
	if( type === 'FunctionDeclaration' && node.id )
	{
		return node.id.name;
	}
	if( type === 'MethodDefinition' && node.key ){
		return node.key.name;
	}
	return "anon function @" + node.loc.start.line;
}

// Helper function for allowing parameterized formatting of strings.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();