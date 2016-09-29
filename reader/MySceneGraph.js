

function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	


	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;
		

	this.materialsList = [];

	// File reading 
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */

	this.reader.open('scenes/'+filename, this);  
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function() 
{
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseGlobalsExample(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}	

	var sceneError = this.parseScene(rootElement);
	
	if (sceneError != null) {
		this.onXMLError(sceneError);
		return;
	}
	
	var illuminationError = this.parseIllumination(rootElement);
	
	if (illuminationError != null) {
		this.onXMLError(illuminationError);
		return;
	}
	
	var texturesError = this.parseTextures(rootElement);
	
	if (texturesError != null) {
		this.onXMLError(texturesError);
		return;
	}
	

	var materialsError = this.parseMaterials(rootElement);
	
	if (materialsError != null) {
		this.onXMLError(materialsError);
		return;
	}
	
	var viewsError = this.parseViews(rootElement);
	
	if (viewsError != null) {
		this.onXMLError(viewsError);
		return;
	}
	
	var transformationsError = this.parseTransformations(rootElement);
	
	if (transformationsError != null) {
		this.onXMLError(transformationsError);
		return;
	}
	
	this.loadedOk=true;
	
	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};



/*
 * Example of method that parses elements of one block and stores information in a specific data structure
 */
MySceneGraph.prototype.parseGlobalsExample= function(rootElement) {
	
	var elems =  rootElement.getElementsByTagName('globals');
	if (elems == null) {
		return "globals element is missing.";
	}

	if (elems.length != 1) {
		return "either zero or more than one 'globals' element found.";
	}

	// various examples of different types of access
	var globals = elems[0];
	this.background = this.reader.getRGBA(globals, 'background');
	this.drawmode = this.reader.getItem(globals, 'drawmode', ["fill","line","point"]);
	this.cullface = this.reader.getItem(globals, 'cullface', ["back","front","none", "frontandback"]);
	this.cullorder = this.reader.getItem(globals, 'cullorder', ["ccw","cw"]);

	console.log("Globals read from file: {background=" + this.background + ", drawmode=" + this.drawmode + ", cullface=" + this.cullface + ", cullorder=" + this.cullorder + "}");

	/*var tempList=rootElement.getElementsByTagName('list');

	if (tempList == null  || tempList.length==0) {
		return "list element is missing.";
	}
	
	this.list=[];
	// iterate over every element
	var nnodes=tempList[0].children.length;
	for (var i=0; i< nnodes; i++)
	{
		var e=tempList[0].children[i];

		// process each element and store its information
		this.list[e.id]=e.attributes.getNamedItem("coords").value;
		console.log("Read list item id "+ e.id+" with value "+this.list[e.id]);
	};*/

};

MySceneGraph.prototype.parseScene = function(rootElement)
{
	var elems =  rootElement.getElementsByTagName('scene');
	if (elems == null) {
		return "scene element is missing.";
	}

	if (elems.length != 1) {
		return "either zero or more than one 'scene' element found.";
	}
	
	var scene = elems[0];
	
	this.root = this.reader.getString(scene, 'root');
	this.axis_length = this.reader.getFloat(scene, 'axis_length');
	
	console.log("Scene read from file: root = " + this.root + ", axis_length = " + this.axis_length);
}
	
MySceneGraph.prototype.parseIllumination = function(rootElement)
{
	var elems =  rootElement.getElementsByTagName('illumination');
	if (elems == null) {
		return "illumination element is missing.";
	}
	if (elems.length != 1) {
		return "either zero or more than one 'illumination' element found.";
	}
	
	var ambient = elems[0].getElementsByTagName('ambient');
	if (ambient == null) {
		return "ambient element is missing.";
	}
	if (ambient.length != 1) {
		return "either zero or more than one 'ambient' element found.";
	}
	
	var background = elems[0].getElementsByTagName('background');
	if (background == null) {
		return "background element is missing.";
	}

	if (background.length != 1) {
		return "either zero or more than one 'background' element found.";
	}
	
	elems = elems[0];
	
	this.doubleSided = this.reader.getBoolean(elems, 'doublesided');
	this.local = this.reader.getBoolean(elems, 'local');
	
	console.log('Illumination read from file: doubleSided = ' + this.doubleSided + ", local = " + this.local);
	
	ambient = ambient[0];
	this.ambientR = this.reader.getFloat(ambient, 'r');
	this.ambientG = this.reader.getFloat(ambient, 'g');
	this.ambientB = this.reader.getFloat(ambient, 'b');
	this.ambientA = this.reader.getFloat(ambient, 'a');
	
	console.log('Illumination read from file: Ambient R = ' + this.ambientR + ", Ambient G = " + this.ambientG + ", Ambient B = " + this.ambientB + ", Ambient A = ", this.ambientA);

	background = background[0];
	this.backgroundR = this.reader.getFloat(background, 'r');
	this.backgroundG = this.reader.getFloat(background, 'g');
	this.backgroundB = this.reader.getFloat(background, 'b');
	this.backgroundA = this.reader.getFloat(background, 'a');
	
	console.log('Illumination read from file: Background R = ' + this.backgroundR + ", Background G = " + this.backgroundG + ", Background B = " + this.backgroundB + ", Background A = ", this.backgroundA);	
}	

MySceneGraph.prototype.parseTextures = function(rootElement)
{
	var textures = rootElement.getElementsByTagName('textures');

	if (textures == null  || textures.length==0) {
		return "textures element is missing.";
	}
	
	this.textureList=[];
	
	var numText = textures[0].children.length;
	
	if(numText <= 0)
		return "texture elements are missing";
	
	for (var i = 0; i < numText; i++)
	{
		var e = textures[0].children[i];
		// process each element and store its information
		this.textureList[e.id] = e.attributes.getNamedItem("id").value;
		this.textureList[e.file] = e.attributes.getNamedItem("file").value;
		this.textureList[e.s] = e.attributes.getNamedItem("length_s").value;
		this.textureList[e.t] = e.attributes.getNamedItem("length_t").value;
		
		console.log("Texture read from file: ID = " + this.textureList[e.id] + ", File = " + this.textureList[e.file] + ",S Length = " + this.textureList[e.s] + ",T Length = " + this.textureList[e.t]);
	};
	
}
	
MySceneGraph.prototype.parseViews = function(rootElement)
{
	var views = rootElement.getElementsByTagName('views');
	
	if (views == null  || views.length==0) {
		return "views element is missing.";
	}
	
	var perspective = rootElement.getElementsByTagName('perspective');

	if (perspective == null  || perspective.length==0) {
		return "perspective element is missing.";
	}

	var from = rootElement.getElementsByTagName('from');

	if (from == null  || from.length==0) {
		return "from element is missing.";
	}
	
	var to = rootElement.getElementsByTagName('to');

	if (to == null  || to.length==0) {
		return "to element is missing.";
	}

	views = views[0];
	this.default = this.reader.getString(views, 'default');

	perspective = perspective[0];
	this.id = this.reader.getString(perspective, 'id');
	this.near = this.reader.getFloat(perspective, 'near');
	this.far = this.reader.getFloat(perspective, 'far');
	this.angle = this.reader.getFloat(perspective, 'angle');

	from = from[0];
	this.fromX = this.reader.getFloat(from, 'x');
	this.fromY = this.reader.getFloat(from, 'y');
	this.fromZ = this.reader.getFloat(from, 'z');
	
	to = to[0];
	this.toX = this.reader.getFloat(to, 'x');
	this.toY = this.reader.getFloat(to, 'y');
	this.toZ = this.reader.getFloat(to, 'z');

	console.log("Perspective :id= " + this.id + " near= " + this.near + " far= "+ this.far + " angle= " + this.angle);
	console.log("from x= " + this.fromX + " y= " + this.fromY + " z= " + this.fromZ);
	console.log("to x= " + this.toX + " y= " + this.toY + " z= " + this.toZ);	
}	


MySceneGraph.prototype.parseMaterials = function(rootElement)
{
	var attrib = ['emission', 'ambient', 'diffuse', 'specular', 'shininess'];
	var rgba = ["r", "g", "b", "a"];

	var materials = rootElement.getElementsByTagName('materials');

	if (materials == null  || materials.length==0) {
		return "materials element is missing.";
	}
	
	
	var ltMaterial = materials[0].getElementsByTagName('material');
	
	for(var i = 0; i< ltMaterial.length; i++){
			
		var id = ltMaterial[i].attributes.getNamedItem("id").value;
	
		if(id === null)
			continue;
		
		// is necessary to check if already exist a material with this id!!!

			
		var material = [];

		// obtain shininess attributes
		var x =  ltMaterial[i].getElementsByTagName('shininess')[i];	
		material[4] = x.getAttribute("value");

		//obtain  ambient, emission, diffuse and specular attributes
		for(var j = 0; j < attrib.length -1; j++){
			
			var att = ltMaterial[i].getElementsByTagName(attrib[j]);

			material[j] = [];
			for(var k = 0; k < rgba.length; k++){

				material[j][k] = att[i].getAttribute(rgba[k]);
				console.log("Material property: " + material[j][k]);
			}	
			
		}
		
		
		var mat = new CGFappearance(this.scene);
		mat.setEmission(material[0][0], material[0][1], material[0][2], material[0][3]);
		mat.setAmbient(material[1][0], material[1][1], material[1][2], material[1][3]);
		mat.setDiffuse(material[2][0], material[2][1], material[2][2], material[2][3]);
		mat.setSpecular(material[3][0], material[3][1], material[3][2], material[3][3]);
		mat.setShininess(material[4]);
		
		
		this.materialsList[i] = [];
		this.materialsList[i][0] = id;
		this.materialsList[i][1] = mat;

	};
	
	console.log("Material :" + this.materialsList[0].length);

}

MySceneGraph.prototype.parseTransformations = function(rootElement)
{
	var transformations = rootElement.getElementsByTagName('transformations');
	
	if (transformations == null  || transformations.length==0) {
		return "transformations element is missing.";
	}
	
	var numTransf = transformations[0].children.length;
	
	if(numTransf <= 0)
		return "transformation elements are missing";
	
	this.transformationList = [];
	
	for(var i = 0; i < numTransf; i++)
	{
		var e = transformations[0].children[i];
		this.transformationList[e.id] = this.reader.getString(e, 'id');
				
		var translate = e.getElementsByTagName('translate');
		if (translate[0] != null)
		{
			this.transformationList[0] = translate[0].attributes.getNamedItem("x").value;
			this.transformationList[1] = translate[0].attributes.getNamedItem("y").value;
			this.transformationList[2] = translate[0].attributes.getNamedItem("z").value; 
		}
		else
		{
			this.transformationList[0] = 0;
			this.transformationList[1] = 0;
			this.transformationList[2] = 0;
		}
		
		var rotate = e.getElementsByTagName('rotate');
		if (rotate[0] != null)
		{
			this.transformationList[3] = rotate[0].attributes.getNamedItem("axis").value;
			this.transformationList[4] = rotate[0].attributes.getNamedItem("angle").value;
		}
		else
		{
			this.transformationList[3] = 0;
			this.transformationList[4] = 0;
		}
		
		
		var scale = e.getElementsByTagName('scale');
		if (scale[0] != null)
		{
			this.transformationList[5] = scale[0].attributes.getNamedItem("x").value;
			this.transformationList[6] = scale[0].attributes.getNamedItem("y").value;
			this.transformationList[7] = scale[0].attributes.getNamedItem("z").value; 
		}
		else
		{
			this.transformationList[5] = 0;
			this.transformationList[6] = 0;
			this.transformationList[7] = 0;
		}
		
		console.log("Transformation read from file: ID = " + this.transformationList[e.id] +  " TX = " + this.transformationList[0] +  " TY = " + this.transformationList[1] +  " TZ = " + this.transformationList[2]
		+ " Rotation axis: " + this.transformationList[3] + " R Angle " + this.transformationList[4]
		+ " SX = " + this.transformationList[5] + " SY = " +  this.transformationList[6] + " SZ = " + this.transformationList[7]);
		
	}
	
	
}


/*
 * Callback to be executed on any read error
 */
 
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};


