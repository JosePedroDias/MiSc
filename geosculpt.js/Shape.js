/**
 * Shape(shape) -> .clone(shape)
 *
 * array of vertices (3 coordinates) 					GS_VERTS_TYPE m_vertices	idx -> [x,y,z]
 * array of faces (4 vertex indices) 					GS_FACES_TYPE m_faces		idx -> [v1,v2,v3,v4]
 * array of faces colors (Color3f - 3 RGB channels) 	GS_COLORS_TYPE m_colors		idx -> [r,g,b]
 * associates vertices and faces 						GS_EDGE_MAP_TYPE m_edgeMap	op -> op	(hashmap/object)

inEdgeMap? 
	val = this.edgeMap[key]
	return (typeof val !== 'undefined');
 */


GS.Shape = function(scene) {
	this.scene = scene;
	
	this.vertices	= [];
	this.faces		= [];
	this.colors		= [];	// uses face indices
	this.edgeMap	= {};
	
	this.defaultColor	= Math.random() * 0xFFFFFF;
	this.singleColorMtl	= true;
	this.wireframeMode	= false;
};



GS.Shape.prototype = {
	
	_init: function() {
		this.colors = [];
		for (var i = 0, iLen = this.faces.length; i < iLen; ++i) {
			this.colors.push( Math.random() * 0xFFFFFF );
		}
	},
	
	clone: function() {
		var i, it;
		var s = new GS.Shape();
		
		s.scene				= this.scene;
		s.defaultColor		= this.defaultColor;
		s.singleColorMtl	= this.singleColorMtl;
		s.wireframeMode		= this.wireframeMode;
		
		// copy vertices, faces, colors
		s.vertices = new Array(this.vertices.length);
		for (i = 0, iLen = this.vertices.length; i < iLen; ++i) {
			it = this.vertices.vertices[i];
			s.vertices[i] = it.slice();
		}
		
		s.faces = new Array(this.faces.length);
		for (i = 0, iLen = this.faces.length; i < iLen; ++i) {
			it = this.faces.vertices[i];
			s.faces[i] = it.slice();
		}
		
		s.colors = this.colors.slice(0);
		
		s._init();
		s._finishCreation();
		
		return s;
	},
	
	_finishCreation: function(changeColor) {
		//if (changeColor)
			//this.colors.assign( numFaces(), m_defaultColor );	// TODO
		
		this._updateStructure();
	},
	
	_updateStructure: function() {
		var i, v;
		
		if (this.geo) {
			this.scene.removeObject(this.mesh);
			delete this.geo;
			delete this.mesh;
		}
		this.geo = new THREE.Geometry();
		this.geo.id = 'GS';
		
		for (i = 0; i < this.vertices.length; ++i) {
			v = this.vertices[i];
			this.geo.vertices.push(	new THREE.Vertex( new THREE.Vector3(v[0], v[1], v[2]) ) );
		}
		
		for (i = 0; i < this.faces.length; ++i) {
			v = this.faces[i];
			this.geo.faces.push( new THREE.Face4(v[0], v[1], v[2], v[3]) );
		}
		
		// face normals can be autocalculated or _getFaceNormal - test perf diff
		this.geo.computeCentroids();	// WHAT FOR?!
		this.geo.computeFaceNormals();
		
		// face colors the same
		if (this.singleColorMtl) {
			this.mesh = new THREE.Mesh(
				this.geo,
				
				[
				new THREE.MeshNormalMaterial({
					//overdraw:		true,
					//doubleSided:	false,
					//wireframe:		this.wireframeMode,
				})
				,
				new THREE.MeshBasicMaterial({
					color:					0x000000,
					wireframe:				true,
					wireframeLinewidth:		2,
					transparent:			true
				})
				]
				
				/*new THREE.MeshLambertMaterial({
					color:	0xDDDDDD,
					shading: THREE.FlatShading
				})*/
				
				/*new THREE.MeshBasicMaterial({
					color:					this.defaultColor,
					//overdraw:				false,
					wireframe:				this.wireframeMode,
					wireframeLinewidth:		2
		        })*/
			);
		}
		else {

			
			var face;
			for (i = 0, iLen = this.geo.faces.length; i < iLen; ++i) {
				face = this.geo.faces[i];
				face.material = [ new THREE.MeshBasicMaterial({
					color:		this.colors[i],
					wireframe:	this.wireframeMode
				}) ];
			}
			
			this.mesh = new THREE.Mesh(
				this.geo,
				new THREE.MeshFaceMaterial()
			);
		}
		
		this._computeEdgeMap();
		
		this.scene.addObject(this.mesh);
	},
	
	_computeEdgeMap: function(debug) {
		var i, iLen, j, f, a, b, key, val;
		this.edgeMap = {};
		
		for (i = 0, iLen = this.faces.length; i < iLen; ++i) {
			f = this.faces[i];
			
			for (j = 0; j < 4; ++j) {	// f.length ~ 4
				a = f[(j+1) % 4];
				b = f[ j       ];		// f.length ~ 4
				
				key = new GS.OrderedPair(a, b);
				val = this.edgeMap[key]
				
				if (val !== undefined) {
					// update
					val.addItem(i);
					if (debug) console.log(key + ' -> ' + val);
				}
				else {
					// create
					val = new GS.OrderedPair(i);
					this.edgeMap[key] = val;
					if (debug) console.log(key + ' -> ' + val);
				}
			}
		}
	},
	
	_getEdges: function() {
		var r = [];
		for (k in this.edgeMap) r.push( this.edgeMap[k] );
		return r;
	},
	
	printEdgeMap: function() {
		var k, v;
		for (k in this.edgeMap) {
			v = this.edgeMap[k];
			console.log(k + ' -> ' + v);
		}
	},
	
	printEdges: function() {
		var r = '';
		for (var k in this.edgeMap) {
			r += ', ' + k;
		};
		console.log( r.substring(2) );
	},
	
	
	
	/** LOW LEVEL OPERATIONS **/
	
	_isInEdgeMap: function(key) {
		return (typeof this.edgeMap[key] !== 'undefined');
	},
	
	_isInEdgeLoop: function(edgeLoop, edge) {
		var EDGE, i, iLen = edgeLoop.length;
		for (i = 0; i < iLen; ++i) {
			EDGE = edgeLoop[i];
			if (EDGE.equals(edge)) return true;
		}
		return false;
	},
	
	_isInFaceLoop: function(faceLoop, faceIdx) {
		var FACEIDX, i, iLen = faceLoop.length;
		for (i = 0; i < iLen; ++i) {
			FACEIDX = faceLoop[i];
			return (faceIdx === FACEIDX);
		}
		return false;
	},
	
	
	/**
	 * @function {GS.OrderedPair|undefined} ?
	 * returns opposite edge of 4 vertices face, undefined if none found
	 * @param {int}				faceIdx
	 * @param {GS.OrderedPair}	edge
	 */
	_getOppositeEdge: function(faceIdx, edge) {
		var edges = [];
		var verticesInFace = this.faces[faceIdx];
		var i, op;
		
		// fill edges list
		for (i = 0; i < 4; ++i) {
			edges.push( new GS.OrderedPair(verticesInFace[i % 4], verticesInFace[(i + 1) % 4]) );
		}
	
		// identify edge and send (edge+2) % 4
		for (i = 0; i < 4; ++i) {
			op = edges[i];	// TODO EQUALS
			if (op.equals(edge)) return edges[ (i + 2) % 4 ];
		}
	},
	
	/**
	 * @function {int[]} face indices of neighbour faces
	 * @param {int}		faceIdx
	 * @param {Boolean}	debug
	 */
	_getNeighbourFaces: function(faceIdx, debug) {
		var neighbourFaces = [];
		var i, v1, v2, edge, nFaces, item;
		
		for (i = 0; i < 4; ++i) {
			v1 = this.faces[faceIdx][ i       ];
			v2 = this.faces[faceIdx][(i+1) % 4];
			
			edge = new GS.OrderedPair(v1, v2);
			nFaces = this.edgeMap[edge];
			
			item = nFaces.items[0];
			if ( (item !== undefined) && (item !== faceIdx) )	neighbourFaces.push(item);
	
			item = nFaces.items[1];
			if ( (item !== undefined) && (item !== faceIdx) )	neighbourFaces.push(item);
			
			if (debug) console.log('edge: ' + edge + ' face: #' + (nFaces.items[0] !== faceIdx ? nFaces.items[0] : nFaces.items[1]) );
		}
		
		return neighbourFaces;
	},
	
	/**
	 * @function {GS.OrderedPair[]} ? edge loop
	 * @param {GS.OrderedPair} edge
	 */
	_getEdgeLoop: function(edge) {
		var edgeSet = [];
		var nextEdge = edge.clone();
		var theseFaces, newEdge1, newEdge2;
	
		while (true) {
			var theseFaces = this.edgeMap[nextEdge];
			var faceIndex1 = theseFaces.items[0];
			var faceIndex2 = theseFaces.items[1];
	
			newEdge1 = this._getOppositeEdge(faceIndex1, nextEdge);	// CLONE?
			newEdge2 = this._getOppositeEdge(faceIndex2, nextEdge);
	
			if		( !this._isInEdgeLoop(edgeSet, newEdge1) )	nextEdge = newEdge1;//.clone();
			else if ( !this._isInEdgeLoop(edgeSet, newEdge2) )	nextEdge = newEdge2;//.clone();
			else												return edgeSet;

			edgeSet.push(nextEdge);
		}
	},
	
	_filterDuplicates: function(arr) {
		var found = {};
		var arr2 = [];
		var el;
		
		for (var i = 0, iLen = arr.length; i < iLen; ++i) {
			el = arr[i];
			if (found[el]) continue;
			found[el] = true;
			arr2.push(el);
		}
		
		return arr2;
	},
	
	/**
	 * @function {GS.OrderedPair[]} ? face loop
	 * @param {GS.OrderedPair} edge
	 * TODO: BUGGY
	 */
	_getFaceLoop: function(edge) {
		var edgeSet = [];
		var faceSet = [];
		var nextEdge = edge;//.clone();
		var theseFaces, faceIdx1, faceIdx2, newEdge1, newEdge2;
		
		while (true) {
			theseFaces = this.edgeMap[nextEdge];
			faceIdx1 = theseFaces.items[0];
			faceIdx2 = theseFaces.items[1];
			newEdge1 = this._getOppositeEdge(faceIdx1, nextEdge);
			newEdge2 = this._getOppositeEdge(faceIdx2, nextEdge);
			
			if		( !this._isInEdgeLoop(edgeSet, newEdge1) ) {
				if ( !this._isInFaceLoop(faceSet, faceIdx1) )	faceSet.push(faceIdx1);
				nextEdge = newEdge1;
			}
			else if ( !this._isInEdgeLoop(edgeSet, newEdge2) ) {
				if ( !this._isInFaceLoop(faceSet, faceIdx2) )	faceSet.push(faceIdx2);
				nextEdge = newEdge2;
			}
			else {
				if ( !this._isInFaceLoop(faceSet, faceIdx1) )	faceSet.push(faceIdx1);
				if ( !this._isInFaceLoop(faceSet, faceIdx2) )	faceSet.push(faceIdx2);
				//return faceSet;
				return this._filterDuplicates(faceSet);
			}
			
			edgeSet.push(nextEdge);
		}
	},
	
	/**
	 * @function {float[]} ? versor
	 * @param {GS.OrderedPair} edge
	 */
	_getEdgeNormalDirection: function(edge) {
		var neighbourFaces = this.edgeMap[edge];
		var n1 = [0, 0, 0];
		var n2 = [0, 0, 0];
		var faceIdx1 = neighbourFaces.items[0];
		var faceIdx2 = neighbourFaces.items[1];
		if (faceIdx1 !== undefined)	n1 = this._getFaceNormal(faceIdx1);
		if (faceIdx2 !== undefined)	n2 = this._getFaceNormal(faceIdx2);
		var s = [ n1[0]+n2[0], n1[1]+n2[1], n1[2]+n2[2] ];				// s = n1 + n2
		var len = Math.sqrt( s[0]*s[0] + s[1]*s[1] + s[2]*s[2] );		// normalize...
		return [ s[0]/len, s[1]/len, s[2]/len ];
	},
	
	/**
	 * @function {float[]} ? center (avg of 2 points)
	 * @param {GS.OrderedPair} edge
	 */
	_getEdgeCenter: function(edge) {
		var v1 = this.vertices[ edge.items[0] ];
		var v2 = this.vertices[ edge.items[1] ];
		var a = [ v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2] ];	// a = v1 + v2
		return [ a[0]*0.5, a[1]*0.5, a[2]*0.5 ];			// a * 0.5
	},
	
	/**
	 * @function {float[]} ? gets the direction of the nth neighbour to the edge
	 * @param {GS.OrderedPair} edge to inspect
	 * @param {GS.OrderedPair} faceNr the face number (0-1)
	 */
	_getEdgeDirection: function(edge, faceNr) {
		var v12avg = this._getEdgeCenter(edge);
		
		// get opposite edge of face 1
		var theseFaces = this.edgeMap[edge];
		var faceIdx1 = theseFaces.items[faceNr];
		var edge2 = this._getOppositeEdge(faceIdx1, edge);
		var v34avg = this._getEdgeCenter(edge2);
		
		var n = [ v12avg[0]-v34avg[0], v12avg[1]-v34avg[1], v12avg[2]-v34avg[2] ];	// v12avg - v34avg
		// normalize
		var len = Math.sqrt( n[0]*n[0] + n[1]*n[1] + n[2]*n[2] );
		return [n[0]/len, n[1]/len, n[2]/len ];
	},
	
	/**
	 * @function {float[]} ? gets the position of the center of the face
	 * @param {int} faceIdx
	 */
	_getFaceCenter: function(faceIdx) {
		var ctr = [0, 0, 0];
		var faceInfo = this.faces[faceIdx];
		var vtx;
		
		for (var v = 0; v < 4; ++v) {
			vtx = this.vertices[ faceInfo[v] ];
			ctr[0] += vtx[0];	ctr[1] += vtx[1];	ctr[2] += vtx[2];	// ctr += vtx;
		}
		ctr[0] *= 0.25;	ctr[1] *= 0.25;	ctr[2] *= 0.25;					// ctr += 0.25;
		return ctr;
	},
	
	/**
	 * @function {float[]} ?
	 * @param {int|int[]} faceIdx/face
	 */
	_getFaceNormal: function(face) {
		if (typeof face === 'number') face = this.faces[face];
		
		// get 3 of the 4 vertices
		var v1 = this.vertices[ face[0] ];
		var v2 = this.vertices[ face[1] ];
		var v3 = this.vertices[ face[2] ];
		
		// find 2 vectors inside the face plane
		var a = [ v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2] ];
		var b = [ v3[0] - v2[0], v3[1] - v2[1], v3[2] - v2[2] ];
		
		// get the normal vector the the latter and normalize it
		var n = [
			a[1] * b[2] - a[2] * b[1],
			a[2] * b[0] - a[0] * b[2],
			a[0] * b[1] - a[1] * b[0]
		];
		
		// normalize
		var len = Math.sqrt(n[0]*n[0] + n[1]*n[1] + n[2]*n[2] );
		return [n[0]/len, n[1]/len, n[2]/len];
	},


	/**
	 * @function {float[]} ?
	 * @param {int} faceIdx
	 * @param {int} edgeNum (0-3)
	 */
	_getFaceDirection: function(faceIdx, edgeNr) {
		var face = this.faces[faceIdx];
		var edge = new GS.OrderedPair(face[edgeNr], face[(edgeNr + 1) % 4]);
		var fc = this._getFaceCenter(faceIdx);
		var ec = this._getEdgeCenter(edge);
		
		var n = [ec[0]-fc[0], ec[1]-fc[1], ec[2]-fc[2]];
		var len = Math.sqrt(n[0]*n[0] + n[1]*n[1] + n[2]*n[2] );	// normalize
		return [n[0]/len, n[1]/len, n[2]/len];
	},

	
	
	/** OPERATIONS **/
	
	/**
	 * @function ? Moves the face with given index applying delta displacement
	 * @param {int}		faceIdx	the face to move
	 * @param {float[]}	delta	the displacement to apply
	 */
	moveFaceDelta: function(faceIdx, delta) {
		var f = this.faces[faceIdx];	// get vertex indices

		// update each vertex forming the face
		var v;
		for (var i = 0; i < 4; ++i) {
			v = this.vertices[ f[i] ][0] += delta[0];	// v += delta
			v = this.vertices[ f[i] ][1] += delta[1];
			v = this.vertices[ f[i] ][2] += delta[2];
		}
		
		this._updateStructure();
	},
	
	/**
	 * @function ? Moves the face with given index, in the direction of its normal
	 * @param {int}		faceIdx		the face to move
	 * @param {float}	distance	the distance to apply to the face in normal direction
	 */
	moveFaceOutward: function(faceIdx, distance) {
		var n = this._getFaceNormal(faceIdx);
		n[0] *= distance;	n[1] *= distance;	n[2] *= distance;	// n *= distance
		this.moveFaceDelta(faceIdx, n);
	},
	
	/**
	 * @function ? Moves the face with given index, in the direction of the chosen edge
	 * @param {int}		faceIdx		the face to move
	 * @param {int}		edgeNr		the face's edge (0-3)
	 * @param {float}	distance	the distance to apply to the face in edge's direction
	 */
	moveFaceDirection: function(faceIdx, edgeNr, distance) {
		var n = this._getFaceDirection(faceIdx, edgeNr);
		n[0] *= distance;	n[1] *= distance;	n[2] *= distance;	// n *= distance
		this.moveFaceDelta(faceIdx, n);
	},
	
	
	
	/**
	 * @function Extrudes the selected index face a given distance
	 * @param {int}		faceIdx		the index of the face to extrude
	 * @param {float}	distance	the outward distance of the new geometry
	 */
	extrudeFace: function(faceIdx, distance) {
		var i, j, oldVertex, newVertex;
		
		// compute delta to apply to new vertices
		var oldVertices = this.faces[faceIdx];
		var normal = this._getFaceNormal(faceIdx);
		var oldLen = this.vertices.length;
	
		// create 4 new vertices
		var newVertices = [];
		for (i = 0; i < 4; ++i) {
			newVertices.push( oldLen + i );
			oldVertex = this.vertices[ oldVertices[i] ];
			newVertex = [0, 0, 0];
			for (j = 0; j < 3; ++j) {
				newVertex[j] = distance * normal[j] + oldVertex[j];
			}
			this.vertices.push(newVertex);
		}
	
		// update main face
		this.faces[faceIdx] = newVertices;
		var faceColor = this.colors[faceIdx];
	
		// create 4 new side faces
		var newFace;
		for (i = 0; i < 4; ++i) {
			newFace = [0, 0, 0, 0];
			newFace[0] = oldVertices[(i + 1) % 4];
			newFace[1] = newVertices[(i + 1) % 4];
			newFace[2] = newVertices[ i      % 4];
			newFace[3] = oldVertices[ i      % 4];
			
			this.faces.push(newFace);
			this.colors.push( Math.random() * 0xFFFFFF );	// TODO
			//this.colors.push(faceColor);
		}
		
		this._updateStructure();
	},
	
	/**
	 * @function ? Utility operation - does an extrude without moving
	 * and applies the given movement afterwards (for custom extrude directions...)
	 * @param {int}		faceIdx	the face to be extruded
	 * @param {float[]}	delta	the displacement to apply
	 */
	extrudeFaceDelta: function(faceIdx, delta) {
		this.extrudeFace(faceIdx, 0);
		this.moveFaceDelta(faceIdx, delta);
	},
	
	
	
	/**
	 * @function ? Bevels the given face the distance specified.
	 * @param {int}		faceIdx
	 * @param {float}	distance
	 */
	bevelFace: function(faceIdx, distance) {
		var i, vBefore, vThis, vAfter, dir1, dir2, mainDir, newVertex, len;
		
		// get vertex indices
		var oldVertexIndices = this.faces[faceIdx];
		
		// prepare vertices list
		var newVertices = [];
		
		// compute each new vertex
		for (i = 0; i < 4; ++i) {
			vBefore	= this.vertices[ oldVertexIndices[(i + 3) % 4] ];
			vThis	= this.vertices[ oldVertexIndices[ i         ] ];
			vAfter	= this.vertices[ oldVertexIndices[(i + 1) % 4] ];
			
			// get main direction by averaging two directions
			dir1 = [ vBefore[0]-vThis[0], vBefore[1]-vThis[1], vBefore[2]-vThis[2] ];	// dir1 = vBefore - vThis);
			dir2 = [ vAfter[0] -vThis[0], vAfter[1] -vThis[1], vAfter[2] -vThis[2] ];	// dir2 = vAfter  - vThis);
			
			len = Math.sqrt(dir1[0]*dir1[0] + dir1[1]*dir1[1] + dir1[2]*dir1[2] );	// normalize dir1
			dir1 = [dir1[0]/len, dir1[1]/len, dir1[2]/len];
			
			len = Math.sqrt(dir2[0]*dir2[0] + dir2[1]*dir2[1] + dir2[2]*dir2[2] );	// normalize dir2
			dir2 = [dir2[0]/len, dir2[1]/len, dir2[2]/len];
			
			mainDir = [ dir1[0]+dir2[0], dir1[1]+dir2[1], dir1[2]+dir2[2] ];		// mainDir = dir1 + dir2;
			
			len = Math.sqrt(mainDir[0]*mainDir[0] + mainDir[1]*mainDir[1] + mainDir[2]*mainDir[2] );	// normalize mainDir
			mainDir = [mainDir[0]/len, mainDir[1]/len, mainDir[2]/len];
	
			// weight it with distance
			mainDir = [ mainDir[0]*distance, mainDir[1]*distance, mainDir[2]*distance ];		// mainDir *= distance;
	
			// add dir and save
			newVertex = [ vThis[0]+mainDir[0], vThis[1]+mainDir[1], vThis[2]+mainDir[2] ];		// newVertex = vThis + mainDir;
			newVertices.push(newVertex);
		}
	
		// update vertex indices
		for (i = 0; i < 4; ++i) {
			this.vertices[ oldVertexIndices[i] ] = newVertices[i];
		}
	
		this._updateStructure();
	},
	
	/**
	 * @function ? Utility method - Performs a 0 distance extrude followed by a bevel operation.
	 * @param {int}		faceIdx
	 * @param {float}	distance
	 */
	bevelExtrudedFace: function(faceIdx, distance) {
		this.extrudeFace(faceIdx, 0);
		this.bevelFace(faceIdx, distance);
	},
	
	
	
	/* used by splitFaceLoop */
	_rotateFace: function(indices) {
		var t = indices.pop();
		indices.unshift(t);
	},
	
	/**
	 * @function ?
	 * @param {GS.OrderedPair}	edge
	 */
	splitFaceLoop: function(edge) {
		var i, iLen, j;
		
		// get loop information
		var edgeLoop = this._getEdgeLoop(edge);
		var faceLoop = this._getFaceLoop(edge);
		var loopLength = faceLoop.length;
		
		// find new vertex indices
		var newVertexIndices = [];
		var lastIdx = this.vertices.length;
		for (j = 0; j < loopLength; ++j) newVertexIndices.push(lastIdx + j);
		
		// create new vertices
		var thisEdge, v1, v2, v;
		for (i = 0, iLen = edgeLoop.length; i < iLen; ++i) {
			thisEdge = edgeLoop[i];
			v1 = this.vertices[ thisEdge.items[0] ];
			v2 = this.vertices[ thisEdge.items[1] ];
			v = [ v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2] ];	// v = (v1 + v2) * 0.5
			v = [ v[0]*0.5, v[1]*0.5, v[2]*0.5 ];
			this.vertices.push(v);
		}
	
		// update faces (old and new)
		var faceIdx, oldVertexIndices, faceA, faceB, otherIdx, nextEdge;
		for (i = 0, iLen = faceLoop.length; i < iLen; ++i) {
			faceIdx = faceLoop[i];
			oldVertexIndices = this.faces[faceIdx];
			
			// aligns vertices in the face with current edge
			while ( ! edgeLoop[i].equals( new GS.OrderedPair(oldVertexIndices[1], oldVertexIndices[2]) ) )
				this._rotateFace(oldVertexIndices);
			
			// checks existence of next edge in remaining positions (if not, use previous)
			nextEdge = edgeLoop[ (i + 1) % loopLength ];
			if ( nextEdge.equals( new GS.OrderedPair(oldVertexIndices[3], oldVertexIndices[0]) ) )
				otherIdx = (i + 1) % loopLength;
			else
				otherIdx = (i - 1 + loopLength) % loopLength;
			
			// change face
			faceA = [0, 0, 0, 0];
			faceA[0] = oldVertexIndices[0];
			faceA[1] = oldVertexIndices[1];
			faceA[2] = newVertexIndices[i];
			faceA[3] = newVertexIndices[otherIdx];
			this.faces[faceIdx] = faceA;
	
			// create new face
			faceB = [0, 0, 0, 0];
			faceB[0] = oldVertexIndices[2];
			faceB[1] = oldVertexIndices[3];
			faceB[2] = newVertexIndices[otherIdx];
			faceB[3] = newVertexIndices[i];
			
			this.faces.push(faceB);
			this.colors.push( Math.random() * 0xFFFFFF );	// TODO
			//this.colors.push( this.colors[faceIdx] );
		}
	
		this._updateStructure();
	},
	
	/**
	 * @function ?
	 * @param {GS.OrderedPair}	edge
	 * @param {float[]}			delta
	 */
	moveEdgeDelta: function(edge, delta) {
		var vertexIdx, v;
		
		// update v1
		vertexIdx = edge.items[0];
		v = this.vertices[vertexIdx];
		v[0] += delta[0];	v[1] += delta[1];	v[2] += delta[2];	// v += delta;
		this.vertices[vertexIdx] = v;
		
		// update v2
		vertexIdx = edge.items[1];
		v = this.vertices[vertexIdx];
		v[0] += delta[0];	v[1] += delta[1];	v[2] += delta[2];	// v += delta;
		this.vertices[vertexIdx] = v;		
		this._updateStructure();
	},
	
	/**
	 * @function ? TODO BUGGY
	 * @param {GS.OrderedPair}	edge
	 * @param {float}			distance
	 */
	moveEdgeOutward: function(edge, distance) {
		var delta = this._getEdgeNormalDirection(edge) * distance;
		this.moveEdgeDelta(edge, delta);
	},
	
	/**
	 * @function ? TODO BUGGY
	 * @param {GS.OrderedPair}	edge
	 * @param {int}				faceNr (0-3)?
	 * @param {float}			distance
	 */
	moveEdgeDirection: function(edge, faceNr, distance) {
		var delta = this._getEdgeDirection(edge, faceNr) * distance;
		this.moveEdgeDelta(edge, delta);
	}
		
};
