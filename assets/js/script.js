//====================================================================================
// Global Variables
//====================================================================================
window.reference_table = {resources:_resources, items:_items};
window.components = [];
window.resources = [];
window.hierarchy = [];

//====================================================================================
// Global Structures
//====================================================================================
function Component() {
	this.parent = null;
	this.name = "";
	this.crafted = false;
	this.craftable = false;
	this.optional = false;
	this.resource = false;
	this.wildcard = false;
	this.wildcard_selection = [];
	this.prev_data = [];
	this.prev_components = [];
	this.recipe = null;
	this.data = null;
	this.ingredientNum = null;
	this.hierarchy = "";
	this.quantity = 0;
	this.option = 0;
	this.components = [];
	this.wildcards = [];
	this.optionals = [];
	
	this.uid = function() {
		return this.hierarchy + this.ingredientNum;
	}
	
	// Select wildcard and add to components list //
	this.selectWildcard = function( wildcard_number, selection ) {
		// Remove previously selected wildcard from components list //
		if( this.wildcard_selection[wildcard_number] ) {
			removeComponent( this.wildcards[wildcard_number][this.wildcard_selection[wildcard_number]], this.components );
		}
		// Add new wildcard component to components list //
		this.wildcard_selection[wildcard_number] = selection;
		this.components.push( this.wildcards[wildcard_number][selection] );
	}
	
	// Remove wildcard from selection and components lists //
	this.clearWildcard = function( wildcard_idx ) {
		for( var i = 0; i < this.wildcards.length; i++ ) {
			if( Number(this.wildcards[i][0].recipe.material_idx) === wildcard_idx ) {
				removeComponent( this.wildcards[i][this.wildcard_selection[i]], this.components );
				this.wildcard_selection[i] = null
				return;
			}
		}
	}
}

//====================================================================================
// Window Onload: 
//====================================================================================
window.addEventListener( 'load', function() {
	$('#crafting-categories').accordion({
		collapsible : true,
		heightStyle : 'content',
	});
	$('.crafting-subcategories').accordion({
		collapsible : true,
		heightStyle : 'content',
	});
	
	// Assign a click event handler to every left-side menu element //
	var items = document.getElementsByClassName('crafting_item');
	for( var i = 0; i < items.length; i++ ) {
		items[i].onclick = StartCrafting;
	}
	
	// Suppress right-click menu on crafting area //
	document.oncontextmenu = function(){return false};
	
	// Set focus handlers for sidebar elements //
	var options = document.getElementById("item");
	var statistics = document.getElementById("statistics");
	var components = document.getElementById("components");
	var resources = document.getElementById("resources");
	options.addEventListener('mouseenter', function(e) {
		options.focus();
	});
	options.addEventListener('mouseleave', function(e) {
		options.blur();
	});
	statistics.addEventListener('mouseenter', function(e) {
		statistics.focus();
	});
	statistics.addEventListener('mouseleave', function(e) {
		statistics.blur();
	});
	components.addEventListener('mouseenter', function(e) {
		components.focus();
	});
	components.addEventListener('mouseleave', function(e) {
		components.blur();
	});
	resources.addEventListener('mouseenter', function(e) {
		resources.focus();
	});
	resources.addEventListener('mouseleave', function(e) {
		resources.blur();
	});
	
	// Add keypress listener to options for search box //
	options.addEventListener('keydown', function(e) {
		var input = String.fromCharCode(e.keyCode).toLowerCase();
		if( e.keyCode === 8 ) {
			var value = document.getElementById("options_search").value;
			document.getElementById("options_search").value = value.substr( 0, value.length - 1 );
		}
		else if( e.keyCode === 27 ) {
			document.getElementById("options_search").value = "";
		}
		else if( /[a-zA-Z0-9-_ ]/.test( input ) ) {
			document.getElementById("options_search").value += input;
		}
		
		// Perform search //
		NarrowOptions();
	});
	
	// Don't allow focus on search box //
	document.getElementById("options_search").addEventListener('mousedown', function(e) {
		e.stopPropagation();
		e.preventDefault();
		options.focus();
	});
	
	// Initialize recipe search //
	document.getElementById("recipe_search").addEventListener( "keyup", NarrowRecipes );
	
	// Preload images //
	document.getElementById("preload").innerHTML += ("<img src=\"./assets/img/crow.png\"><\/img>");
	document.getElementById("preload").innerHTML += ("<img src=\"./assets/img/logo_white.png\"><\/img>");
	document.getElementById("preload").innerHTML += ("<img src=\"./assets/img/stroke4.png\"><\/img>");
	document.getElementById("preload").innerHTML += ("<img src=\"./assets/img/stroke3.png\"><\/img>");
	document.getElementById("preload").innerHTML += ("<img src=\"./assets/img/stroke3_vert.png\"><\/img>");
	document.getElementById("preload").innerHTML += ("<img src=\"./assets/img/crafting_circle.png\"><\/img>");
	document.getElementById("preload").innerHTML += ("<img src=\"./assets/img/crafting_circle_ready.png\"><\/img>");
	document.getElementById("preload").innerHTML += ("<img src=\"./assets/img/stroke3_vert_90.png\"><\/img>");
	document.getElementById("preload").innerHTML += ("<img src=\"./assets/img/stroke3_vert_80.png\"><\/img>");
	document.getElementById("preload").innerHTML += ("<img src=\"./assets/img/stroke3_vert_70.png\"><\/img>");
	for( var i = 0; i < _icons.length; i++ ) {
		document.getElementById("preload").innerHTML += ("<img src=\"" + _icons[i] + "\"><\/img>");
	}
	
	// Scale crafting UI //
	ScaleUI();
}, true );

//====================================================================================
// Window Resize: On window resize, recompute scaling for crafting circle.
// Ensure proper display regardless of resolution.
//====================================================================================
window.addEventListener( 'resize', ScaleUI, true );
//window.addEventListener( 'mousemove', updateTooltipPosition, true );

//====================================================================================
// Window updateTooltipPosition: 
//====================================================================================
function updateTooltipPosition( e ) {
	e = e || window.event;

    var pageX = e.pageX;
    var pageY = e.pageY;

    // IE 8
    if (pageX === undefined) {
        pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
	
	document.getElementById("tooltip").style.top = (pageY + 25);
	document.getElementById("tooltip").style.left = (pageX - 45);
}

//====================================================================================
// ScaleUI: Scale the crafting circle to properly fit on screen based on resolution.
// (Reference resolution is ~1280x600)
//====================================================================================
function ScaleUI() {
	// Scale and position elements based on display resolution //
	var scale = (Math.min( window.innerHeight, window.innerWidth )  / 640);
	var left = (window.innerWidth / 1280);
	
	$('#crafting_circle').css('-webkit-transform', 'scale(' + scale + ')');
	$('#crafting_circle').css('-moz-transform', 'scale(' + scale + ')');
	$('#crafting_circle').css('-ms-transform', 'scale(' + scale + ')');
	$('#crafting_circle').css('-o-transform', 'scale(' + scale + ')');
	$('#crafting_circle').css('transform', 'scale(' + scale + ')');
	$('#crafting_circle').css('left', (left * 50) + 'px' );
	
	$('#crafting_circle_ready0').css('-webkit-transform', 'scale(' + scale + ')');
	$('#crafting_circle_ready0').css('-moz-transform', 'scale(' + scale + ')');
	$('#crafting_circle_ready0').css('-ms-transform', 'scale(' + scale + ')');
	$('#crafting_circle_ready0').css('-o-transform', 'scale(' + scale + ')');
	$('#crafting_circle_ready0').css('transform', 'scale(' + scale + ')');
	$('#crafting_circle_ready0').css('left', (left * 50) + 'px' );
}

//====================================================================================
// removeComponent: 
//====================================================================================
function removeComponent( component, list  ) {
	for( var i = 0; i < list.length; i++ ) {
		if( list[i].uid() === component.uid() ) {
			list[i].crafted = false;
			list.splice( i, 1 );
			i--;
		}
	}
}

//====================================================================================
// removeSubComponents: 
//====================================================================================
function removeSubComponents( component, list  ) {
	for( var i = 0; i < list.length; i++ ) {
		if( list[i].hierarchy.includes( component.hierarchy ) && list[i].uid() !== component.uid() ) {
			if( !list[i].resource ) list[i].crafted = false;
			list.splice( i, 1 );
			i--;
		}
	}
}

//====================================================================================
// Contains: 
//====================================================================================
function Contains( component, list  ) {
	for( var i = 0; i < list.length; i++ ) {
		if( list[i].uid() === component.uid() ) {
			return true;
		}
	}
	return false;
}

//====================================================================================
// GetIcon: 
//====================================================================================
function GetIcon( name, data = null, recipe = null ) {
	var icon = "./assets/img/icons/default.png";
	for( var j = 0; j < _icons.length; j++ ) {
		var icon_path = _icons[j].split("/");
		var icon_name = icon_path[icon_path.length - 1].split(".")[0];
		if( name.replace(/\s/g,'').replace(/[^0-9a-z]/gi, '').toLowerCase() === icon_name.replace(/\s/g,'').toLowerCase() ) {
			icon = _icons[j];
			break;
		} else if( data && recipe ) {
			var parent_id = data.parent_id;
			if( !parent_id && data.combinations ) parent_id = data.combinations[0].parent_id;
			if( parent_id ) {
				if( window.reference_table[recipe.reference_table][parent_id].name.replace(/\s/g,'').replace(/[^0-9a-z]/gi, '').toLowerCase() === icon_name.replace(/\s/g,'').toLowerCase() ) {
					icon = _icons[j];
					break;
				}
			}
		}
	}
	return icon;
}

//====================================================================================
// StartCrafting: 
//====================================================================================
function StartCrafting( _reference_id ) {
	// Generate reference for item //
	var reference_id = null;
	if( typeof _reference_id === 'object' ) {
		reference_id = this.getAttribute( "data-cf-item" );
	} else {
		reference_id = _reference_id;
	}
	
	// Return if no recipe for item (ie, is a resource) //
	if( !_recipes[reference_id] ) return;
	
	// Hide start prompt //
	document.getElementById("start_prompt").style.opacity = 0.0;
	
	// Hide popup //
	HideOptions();
	
	// Create root component //
	var component = new Component();
	component.parent = null;
	component.name = _items[reference_id].name;
	if( !component.name ) component.name = _items[reference_id].combinations[0].name;
	component.recipe = { reference_table:"items", quantity:1 };
	component.data = window.reference_table["items"][reference_id];
	component.ingredientNum = "final_item";
	component.hierarchy = (reference_id + '|');
	component.optional = Number(component.data["is_optional"]);
	component.quantity = 1;
	component.option = 0;
	component.components = [];
	component.wildcards = [];
	component.optionals = [];
	
	// Reset hierarchy element //
	window.hierarchy = [];
	document.getElementById("hierarchy").innerHTML = "";
	
	// Reset sidebar elements //
	document.getElementById("item_details_title").innerHTML = _items[reference_id].name + " Options<hr\/>";
	document.getElementById("current_component_title").innerHTML = "";
	document.getElementById("item_details").innerHTML = "";
	
	document.getElementById("item_stats_title").innerHTML = "";
	document.getElementById("item_stats").innerHTML = "";
	
	document.getElementById("item_components_title").innerHTML = "";
	document.getElementById("item_components").innerHTML = "";
	
	document.getElementById("item_resources_title").innerHTML = "";
	document.getElementById("item_resources").innerHTML = "";
	
	// Display crafting circle //
	document.getElementById("crafting_circle").style.opacity = 1.0;
	
	// Clear global components list //
	window.components = [];
	
	// Initialize reset button //
	var reset_button = document.getElementById("reset");
	reset_button.setAttribute( "data-cf-item", reference_id );
	reset_button.onclick = StartCrafting;
	
	// Build crafting circle //
	CraftComponent( component );
}

//====================================================================================
// CraftComponent: 
//====================================================================================
function CraftComponent( parent_component ) {
	
	// Update hierarchy element //
	window.hierarchy.push( parent_component.name );

	// If we have already crafted this component, remove it from the global component list and reload the circle with already-crafted components //
	if( parent_component.components.length != 0 ) {
		removeComponent( parent_component, window.components );
		BuildUI( parent_component );
		return;
	}
	
	// Determine item_id //
	var item_id = parent_component.data.id;
	if( !item_id ) item_id = parent_component.data.combinations[0].id;
	
	// Build recipe components list //
	for( var i = 0; i < _recipes[item_id].length; i++ ) {
		// Build new subComponent and add to parent components list //
		var recipe_component = _recipes[item_id][i];
		var subComponent = new Component();
		subComponent.parent = parent_component;
		subComponent.recipe = recipe_component;
		subComponent.data = window.reference_table[recipe_component.reference_table][recipe_component.reference_id];
		subComponent.name = window.reference_table[recipe_component.reference_table][recipe_component.reference_id].name;
		if( !subComponent.name ) subComponent.name = window.reference_table[recipe_component.reference_table][recipe_component.reference_id].combinations[0].name;
		subComponent.hierarchy = (parent_component.hierarchy + recipe_component.id + '|');
		subComponent.optional = Number(recipe_component["is_optional"]);
		subComponent.resource = ((recipe_component.reference_table === "resources") ? true : false);
		subComponent.crafted = false;
		subComponent.wildcard = Number(recipe_component.is_wildcard);
		subComponent.quantity = 1;
		subComponent.option = 0;
		subComponent.components = [];
		subComponent.wildcards = [];
		subComponent.optionals = [];
		
		// Push wildcard or regular component to parent list //
		if( subComponent.wildcard ) parent_component.wildcards.push( [subComponent] );
		else parent_component.components.push( subComponent );
	}
	
	// Display crafting circle //
	BuildUI( parent_component );
}

//====================================================================================
// BuildUI: 
//====================================================================================
function BuildUI( root_component ) {
	
	// Clear crafting circle ingredient divs //
	var circle_elements = document.getElementsByClassName( 'circle_element' );
	for( var i = 0; i < circle_elements.length; i++ ) {
		var circle_element = circle_elements[i];
		circle_element.innerHTML = "";
		circle_element.style.borderColor = "rgba( 0, 0, 0, 0.0 )";
		circle_element.style.cursor = "default";
		circle_element.onclick = null;
		circle_element.oncontextmenu = null;
		circle_element.onmouseover = null;
		circle_element.onmouseenter = null;
		circle_element.onmouseleave = null;
		circle_element.style.opacity = 0.0;
	}
	
	// Update hierarchy element //
	var hierarchy = "&ltrPar; " + window.hierarchy[0];
	for( var i = 1; i < window.hierarchy.length; i++ ) {
		hierarchy += " &rarrc; ";
		hierarchy +=  window.hierarchy[i];
	}
	document.getElementById("hierarchy").innerHTML = hierarchy;
	
	// If no component to build around, return //
	if( !root_component ) return;
	
	// Update options sidebar //
	document.getElementById("item_details_title").innerHTML = root_component.name + " Options<hr\/>";
	
	// Set back button to return to parent ingredient //
	var back_button = document.getElementById("back");
	back_button.onclick = function() {
		if( window.hierarchy.length > 1 ) window.hierarchy.pop(); // Update hierarchy element //
		BuildUI( root_component.parent )
	};
	
	// Consolidate wildcard items //
	for( var i = 0; i < root_component.wildcards.length; i++ ) {
		for( var j = (i + 1); j < root_component.wildcards.length; j++ ) {
			if( root_component.wildcards[i][0].recipe.material_idx === root_component.wildcards[j][0].recipe.material_idx ) {
				var peer = root_component.wildcards.splice( j, 1 );
				root_component.wildcards[i].push( peer[0][0] );
				j--;
			}
		}
	}
	
	// Show root item name if mouse is on crafting circle //
	document.getElementById("current_component_title").style.opacity = 1.0;
	document.getElementById("child_component_title").style.opacity = 0.0;
	document.getElementById("current_component_title").innerHTML = "&npolint; " + root_component.name;
	document.getElementById("crafting_circle").onmouseover = function() {
		document.getElementById("current_component_title").style.opacity = 1.0;
		document.getElementById("child_component_title").style.opacity = 0.0;
	};
	
	// Set parent item as craftable; we will negate this later if a subcomponent isn't crafted //
	root_component.craftable = true;
	document.getElementById("crafting_circle_ready0").style.opacity = 1.0;
	
	// Fill circle elements with regular/optional components //
	var ingredient_index = 0;
	for( var i = 0; i < root_component.components.length; i++ ) {
		
		// Store component reference //
		var component = root_component.components[i];
		
		// Select the next available circle element //
		var circle_element = circle_elements[ingredient_index];
		ingredient_index++;
		
		// Don't use ingredient 7, it is the final item //
		if( ingredient_index === 7 ) ingredient_index++;
		
		// Save ingredient number to component //
		component.ingredientNum = ("ingredient" + ingredient_index);
		
		// If component is a resource, it is crafted by default //
		if( component.resource && !component.optional ) component.crafted = true;
		
		// Fill circle element with component data //
		circle_element.style.borderColor = "rgba( 100, 100, 100, 0.5 )";
		circle_element.style.cursor = "pointer";
		
		// Update parent component craftable status //
		if( !component.crafted && !component.optional ) {
			root_component.craftable = false;
			document.getElementById("crafting_circle_ready0").style.opacity = 0.0;
		}
		
		// Set click handlers based on component type and crafted status //
		if( !component.resource ) {
			(function( c ){ circle_element.onclick = function() { // Left click a normal component to craft.
				CraftComponent(c)};
			})( component );
		} else if( component.optional && !component.crafted ) {
			(function( c ){ circle_element.onclick = function() { // Left click an optional component to craft.
					c.crafted = true;
					BuildUI( root_component );
				}
			})( component );
		} else {
			(function( r, c ){ circle_element.onclick = function(){ // Left click a resource component to select better options.
				ShowOptions( r, c );
			}})( root_component, component );
		}
		(function( p, c ){ circle_element.oncontextmenu = function(){Uncraft( p, c );}})( root_component, component ); // Right click any component to uncraft.
		(function( c ){ circle_element.onmouseenter = function( component ){ // Child item name shows below circle on mouseover.
			document.getElementById("child_component_title").innerHTML = "&npolint; " + c.name;
			document.getElementById("current_component_title").style.opacity = 0.0;
			document.getElementById("child_component_title").style.opacity = 1.0;
		}})( component );
		
		// Set color based on component type and crafted status //
		if( component.crafted ) circle_element.style.borderColor = "rgba( 0, 255, 0, 0.25 )";
		else if( component.optional ) circle_element.style.borderColor = "rgba( 255, 0, 255, 0.25 )";
		else circle_element.style.borderColor = "rgba( 255, 0, 0, 0.25 )";
		
		// Show quantity in circle element //
		var amount = 1;
		if( component.data.amount ) amount = component.data.amount;
		var root_quantity = root_component.quantity;
		if( component.resource && root_component.quantity < component.recipe.quantity ) root_quantity = 1;
		component.quantity = ((component.recipe.quantity / amount) * root_quantity);
		circle_element.innerHTML = "x" + (component.quantity * amount);
		
		// Set background image for component //
		circle_element.style.backgroundImage = "url( " + GetIcon( component.name, component.data, component.recipe ) + " )";
		
		// Show component //
		circle_element.style.opacity = 1.0;
	}
	
	// Fill circle elements with wildcard components //
	for( var i = 0; i < root_component.wildcards.length; i++ ) {
		
		// Has this wildcard already been selected? //
		if( root_component.wildcard_selection[i] != null ) continue;
		
		// If not, parent is not craftable //
		root_component.craftable = false;
		document.getElementById("crafting_circle_ready0").style.opacity = 0.0;
		
		// Store circle element references //
		var circle_element = circle_elements[ingredient_index];
		ingredient_index++;

		// Display the wildcard placeholder //
		circle_element.style.borderColor = "rgba( 255, 125, 0, 0.25 )";
		circle_element.style.cursor = "pointer";
		(function( p, w ){ circle_element.onclick = function(){ // Left click a wildcard component to show permutations thereof.
			ShowWildcard( p, w )};
		})( root_component, i );
		(function( c ){ circle_element.onmouseenter = function(){ // Child item name shows below circle on mouseover.
			document.getElementById("child_component_title").innerHTML = "&npolint; Wildcard Component";
			document.getElementById("current_component_title").style.opacity = 0.0;
			document.getElementById("child_component_title").style.opacity = 1.0;
		}})( component );
		
		// Set background image for wildcard component //
		circle_element.style.backgroundImage = "url( ./assets/img/icons/wildcard.png )";
		
		// Show component //
		circle_element.style.opacity = 1.0;
	}
	
	// Build root component circle element //
	circle_elements[7].style.borderColor = "rgba( 0, 0, 0, 0.0 )";
	circle_elements[7].style.opacity = 0.2;
	circle_elements[7].style.cursor = "default";
	circle_elements[7].onclick = null;
	circle_elements[7].style.backgroundImage = "url( " + GetIcon( root_component.name, root_component.data, root_component.recipe ) + " )";

	var amount = 1;
	var parent_quantity = 1;
	if( root_component.parent ) parent_quantity = root_component.parent.quantity;
	if( root_component.data.amount ) amount = root_component.data.amount;
	circle_elements[7].innerHTML = "x" + (root_component.quantity * amount);
	
	if( root_component.craftable ) {
		circle_elements[7].style.cursor = "pointer";
		circle_elements[7].onclick = function(){Assemble(root_component)};
		circle_elements[7].style.opacity = 1.0;
	}
	(function( r ){ circle_elements[7].onmouseenter = function( root_component ){ // Child item name shows below circle on mouseover.
		document.getElementById("current_component_title").style.opacity = 1.0;
		document.getElementById("child_component_title").style.opacity = 0.0;
	}})( component );
	
	//*****************************************************
	// Start building sidebar elements
	//*****************************************************
	// Determine type of component, and associated reference container (items, resources, etc.) //
	var dom_string = "";
	var reference = ((root_component.resource) ? _resources : _items );
	for( key in reference ) { // Populate details sidebar with presets for this component.
		if( !reference[key].combinations ) continue;
		
		// If this item has combinations.... //
		var combinations = reference[key].combinations;
		for( var i = 0; i < combinations.length; i++ ) {
			var combination = combinations[i];
			var stats = _stats[key];
			
			// If this combination is of the same type as the current component, add it to the list //
			var root_id = root_component.data.id;
			if( combination.parent_id === root_id ) {
				dom_string += "<div class=\"option\" id=\"" + combination.id + "\">&nbsp;<img class=\"option_icon\" src=\"" + GetIcon( root_component.name, root_component.data, root_component.recipe ) + "\"\/>" + combination.name;
				for( key2 in stats ) {
					for( var j = 0; j < Object.keys(stats).length; j++ ) {
						dom_string += (" (" + Object.keys(stats)[j] + ")");
					}
				}
				dom_string += "<\/div>";
			}
		}
	}
	document.getElementById("item_details").innerHTML = dom_string;
	
	// Set onclick handlers for all preset options //
	var option_elements = document.getElementsByClassName("option");
	for( var i = 0; i < option_elements.length; i++ ) {
		option_elements[i].style.cursor = "pointer";
		var preset = _items[ Number(option_elements[i].getAttribute("id")) ];
		(function( r, p ){ option_elements[i].onclick = function(){
				LoadPreset( r, p )
			};
		})( root_component, preset );
		option_elements[i].style.transition = "all .5s";
		(function( e ){ option_elements[i].onmouseenter = function(){
				e.style.backgroundColor = "rgba( 100, 100, 100, 0.5 )";
			};
		})( option_elements[i] );
		(function( e ){ option_elements[i].onmouseleave = function(){
				e.style.backgroundColor = "rgba( 100, 100, 100, 0.0 )";
			};
		})( option_elements[i] );
	}
	
	// If we populated some options, focus the options list //
	document.getElementById("item").blur();
	if( option_elements.length > 0 ) document.getElementById("item").focus();
	
	// Enable search bar //
	document.getElementById("options_search").value = "";
	document.getElementById("options_search").style.opacity = 1.0;
}

//====================================================================================
// LoadPreset: 
//====================================================================================
function LoadPreset( component, preset ) {
	
	// Uncraft this component //
	Uncraft( null, component );
	
	// Store old parent data, then set it to preset data //
	component.prev_data.push( component.data );
	component.prev_components.push( component.components );
	component.data = preset.combinations[0];
	component.name = component.data.name;
	component.crafted = true;
	component.components = [];
	
	// Determine item_id //
	var item_id = component.data.id;
	
	// Build direct subcomponent objects from preset recipe and store in new parent component list //
	var recipe = _recipes[Number(preset.combinations[0].id)];
	for( var i = 0; i < recipe.length; i++ ) {
		// Build new subComponent and add to parent components list //
		var recipe_component = _recipes[item_id][i];
		var subComponent = new Component();
		subComponent.parent = component;
		subComponent.recipe = recipe_component;
		subComponent.data = window.reference_table[recipe_component.reference_table][recipe_component.reference_id];
		subComponent.name = window.reference_table[recipe_component.reference_table][recipe_component.reference_id].name;
		if( !subComponent.name ) subComponent.name = window.reference_table[recipe_component.reference_table][recipe_component.reference_id].combinations[0].name;
		subComponent.hierarchy = (component.hierarchy + recipe_component.id + '|');
		subComponent.optional = Number(recipe_component["is_optional"]);
		subComponent.resource = ((recipe_component.reference_table === "resources") ? true : false);
		subComponent.crafted = true; // Pre-craft preset components.
		subComponent.wildcard = Number(recipe_component.is_wildcard);
		subComponent.quantity = (component.quantity / recipe_component.quantity);
		subComponent.option = 0;
		subComponent.components = [];
		subComponent.wildcards = [];
		subComponent.optionals = [];
		
		// Push wildcard or regular component to parent list //
		if( subComponent.wildcard ) component.wildcards.push( [subComponent] );
		else component.components.push( subComponent );
	}
	
	// Iterate all subcomponents to build their internal component lists //
	Iterate( component );
	
	// Display updated crafting circle //
	BuildUI( component );
	
}

//====================================================================================
// Iterate: recursively iterate all subcomponents of a component recipe and build
//			internal component lists.
//====================================================================================
function Iterate( parent_component ) {
	for( var i = 0; i < parent_component.components.length; i++ ) {
		component = parent_component.components[i];
		
		// Continue if component is resource (ie has no children) //
		if( component.resource ) {
			for( var j = 0; j < (Number(component.recipe.quantity) * parent_component.quantity); j++ ) {
				window.components.push( component ); // Also push to global components list, because parent is already crafted.
			}
			continue;
		}
		
		// Determine item_id //
		var item_id = component.data.id;
		if( !item_id ) item_id = component.data.combinations[0].id;
		
		// Build direct subcomponent objects from preset recipe and store in new parent component list //
		for( var j = 0; j < _recipes[item_id].length; j++ ) {
			// Build new subComponent and add to parent components list //
			var recipe_component = _recipes[item_id][i];
			var subComponent = new Component();
			subComponent.parent = component;
			subComponent.recipe = recipe_component;
			subComponent.data = window.reference_table[recipe_component.reference_table][recipe_component.reference_id];
			subComponent.name = window.reference_table[recipe_component.reference_table][recipe_component.reference_id].name;
			if( !subComponent.name ) subComponent.name = window.reference_table[recipe_component.reference_table][recipe_component.reference_id].combinations[0].name;
			subComponent.hierarchy = (component.hierarchy + recipe_component.id + '|');
			subComponent.optional = Number(recipe_component["is_optional"]);
			subComponent.resource = ((recipe_component.reference_table === "resources") ? true : false);
			subComponent.crafted = true; // Pre-craft preset components.
			subComponent.wildcard = Number(recipe_component.is_wildcard);
			subComponent.quantity = 1;
			subComponent.option = 0;
			subComponent.components = [];
			subComponent.wildcards = [];
			subComponent.optionals = [];
			
			// Push wildcard or regular component to parent list //
			if( subComponent.wildcard ) component.wildcards.push( [subComponent] );
			else component.components.push( subComponent );
		}
		
		// Recursively iterate components //
		Iterate( component );
	}
}

//====================================================================================
// Uncraft: 
//====================================================================================
function Uncraft( parent_component, component ) {
	
	// If component is a resource, it really shouldn't be uncrafted //
	if( component.resource && !component.optional ) return;
	
	// Set component as not crafted //
	component.crafted = false;
	
	// This is as far as we need to go for optional resources //
	if( component.resource && component.optional ) {
		BuildUI( parent_component );
		return;
	}
	
	// Clear wildcard before popping final element off of prev_data stack //
	if( component.prev_data.length === 0 && parent_component ) {
		parent_component.crafted = false;
		removeComponent( component, window.components );
		parent_component.clearWildcard( Number(component.recipe.material_idx) );
	}
	
	// Restore any previous identity data //
	if( component.prev_data.length > 0 ) {
		component.data = component.prev_data.pop();
		component.components = component.prev_components.pop();
	}
	component.name = component.data["name"];
	
	// Remove all subcomponents from global component list //
	removeSubComponents( component, window.components );

	// If no parent, don't do parent things //
	if( !parent_component )	{
		BuildUI( component );
		return;
	}
	
	// Also restore parent element's identity data, since it will have changed as well //
	if( parent_component.prev_data.length > 0 ) {
		parent_component.data = parent_component.prev_data.pop();
		parent_component.components = parent_component.prev_components.pop();
		removeSubComponents( parent_component, window.components ); // Subcomponents have changed, so start over.
	}
	parent_component.name = parent_component.data.name;
	
	// If this component has a parent, go back to crafting parent //
	BuildUI( parent_component );
}

//====================================================================================
// Assemble: 
//====================================================================================
function Assemble( component ) {
	// Set component as crafted and push all subcomponents to global components list //
	component.crafted = true;
	
	// Add the correct number of subcomponents to the global components list //
	for( var i = 0; i < component.components.length; i++ ) {
		var tmp_component = component.components[i];
		if( tmp_component.crafted && !Contains( tmp_component, window.components ) ) {
			var amount = 1;
			if( tmp_component.data.amount ) amount = tmp_component.data.amount;
			for( var j = 0; j < (Number(tmp_component.quantity) * amount); j++ ) {
				window.components.push( tmp_component );
			}
		}
	}
	
	// If this is the parent component (ie final item), we are ready do display some info! //
	if( !component.parent ) {
		BuildUI( component );
		Finalize( component );
		return;
	}
	
	// Update hierarchy element //
	window.hierarchy.pop();
	
	// Continue crafting up to parent //
	BuildUI( component.parent );
}

//====================================================================================
// ShowOptions: 
//====================================================================================
function ShowOptions( parent_component, component ) {
	document.getElementById("item_details_title").innerHTML = component.name + " Options<hr\/>";
	
	// Display all permutations of this component as options //
	document.getElementById("item_details").innerHTML = "";
	for( key in _resources ) {
		var resource = _resources[key];
		if( resource.parent_id === component.data.id ) {
			document.getElementById("item_details").innerHTML += ("<div class=\'option\' id=\'" + resource.id + "\'><img class=\"option_icon\" src=\"" + GetIcon( component.name, component.data, component.recipe ) + "\"\/>&nbsp;" + resource.name + "<\/div>");
		}
	}
	
	// Set onclick handlers for all options //
	var option_elements = document.getElementsByClassName("option");
	for( var i = 0; i < option_elements.length; i++ ) {
		option_elements[i].style.cursor = "pointer";
		var resource = _resources[Number(option_elements[i].getAttribute("id"))];
		(function( p, c, r ){ option_elements[i].onclick = function(){SelectOption( p, c, r )}; })( parent_component, component, resource );
		option_elements[i].style.transition = "all .5s";
		(function( e ){ option_elements[i].onmouseenter = function(){
				e.style.backgroundColor = "rgba( 100, 100, 100, 0.5 )";
			};
		})( option_elements[i] );
		(function( e ){ option_elements[i].onmouseleave = function(){
				e.style.backgroundColor = "rgba( 100, 100, 100, 0.0 )";
			};
		})( option_elements[i] );
	}
	
	// If we populated some options, focus the options list //
	if( option_elements.length > 0 ) document.getElementById("item").focus();
}

//====================================================================================
// NarrowOptions: 
//====================================================================================
function NarrowOptions() {
	var search_string = document.getElementById("options_search").value.toLowerCase();
	var option_elements = document.getElementsByClassName("option");
	for( var i = 0; i < option_elements.length; i++ ) {
		option_elements[i].style.display = "";
		option_elements[i].style.cursor = "pointer";
		if( !option_elements[i].innerHTML.toLowerCase().includes( search_string ) ) {
			option_elements[i].style.display = "none";
		}
	}
}

//====================================================================================
// NarrowRecipes: 
//====================================================================================
function NarrowRecipes( e ) {
	var search_string = document.getElementById("recipe_search").value.toLowerCase();
	
	// Reset recipe sidebar //
	var recipes = document.getElementsByClassName("ui-accordion");
	for( var i = 0; i < recipes.length; i++ ) {
		recipes[i].style.opacity = 1.0;
		recipes[i].style.zIndex = 1;
	}
	
	// Reset search results sidebar //
	var recipe_results = document.getElementById("recipe_results");
	recipe_results.style.opacity = 0.0;
	recipe_results.style.zIndex = -1;
	
	// If no search query, return //
	if( !search_string ) return;
	
	// Clear search bar if escape is pressed //
	else if( e.keyCode === 27 ) {
		document.getElementById("options_search").value = "";
	}
	
	// Reformat recipe sidebar for easier viewing //
	for( var i = 0; i < recipes.length; i++ ) {
		recipes[i].style.opacity = 0.0;
		recipes[i].style.zIndex = -1;
	}
	
	// Reformat search results sidebar //
	recipe_results.style.opacity = 1.0;
	recipe_results.style.zIndex = 1;
	
	// Narrow results //
	var results_string = "";
	var recipe_elements = document.getElementsByClassName("crafting_item");
	for( var i = 0; i < recipe_elements.length; i++ ) {
		if( recipe_elements[i].innerHTML.toLowerCase().includes( search_string ) ) {
			results_string += ("<div class=\'recipe_result\' data-cf-item=\"" + recipe_elements[i].getAttribute("data-cf-item") + "\">" + recipe_elements[i].innerHTML + "<\/div>");
		}
	}
	recipe_results.innerHTML = results_string;
	
	// Assign onclick handlers //
	var result_elements = document.getElementsByClassName("recipe_result");
	for( var i = 0; i < result_elements.length; i++ ) {
		var data_cf_item = result_elements[i].getAttribute("data-cf-item");
		result_elements[i].style.cursor = "pointer";
		(function( reference_id ){ result_elements[i].onclick = function() {
			document.getElementById("recipe_search").value = "";
			NarrowRecipes(); // Use this to clear sidebar.
			StartCrafting( reference_id )};
		})( data_cf_item );
		(function( e ){ result_elements[i].onmouseenter = function(){
				e.style.backgroundColor = "rgba( 100, 100, 100, 0.5 )";
			};
		})( result_elements[i] );
		(function( e ){ result_elements[i].onmouseleave = function(){
				e.style.backgroundColor = "rgba( 100, 100, 100, 0.0 )";
			};
		})( result_elements[i] );
	}
}

//====================================================================================
// ShowWildcard: 
//====================================================================================
function ShowWildcard( parent_component, wildcard_number ) {
	document.getElementById("item_details_title").innerHTML = "Wildcard Component Options<hr\/>";
	
	// Display all wildcard options //
	document.getElementById("item_details").innerHTML = "";
	var wildcards = parent_component.wildcards[wildcard_number];
	for( var i = 0; i < wildcards.length; i++ ) {
		var wildcard = window.reference_table[wildcards[i].recipe.reference_table][wildcards[i].recipe.reference_id];
		document.getElementById("item_details").innerHTML += ("<div class=\'option\' id=\'" + i + "\'><img class=\"option_icon\" src=\"" + GetIcon( wildcard.name ) + "\"\/>&nbsp;" + wildcard.name + "<\/div>");
	}
	
	// Set onclick handlers for all options //
	var option_elements = document.getElementsByClassName("option");
	for( var i = 0; i < option_elements.length; i++ ) {
		option_elements[i].style.cursor = "pointer";
		(function( p, n, i ){ option_elements[i].onclick = function(){SelectWildcard( p, n, i )}; })( parent_component, wildcard_number, Number(option_elements[i].getAttribute("id")) );
		option_elements[i].style.transition = "all .5s";
		(function( e ){ option_elements[i].onmouseenter = function(){
				e.style.backgroundColor = "rgba( 100, 100, 100, 0.5 )";
			};
		})( option_elements[i] );
		(function( e ){ option_elements[i].onmouseleave = function(){
				e.style.backgroundColor = "rgba( 100, 100, 100, 0.0 )";
			};
		})( option_elements[i] );
	}
	
	// If we populated some options, focus the options list //
	if( option_elements.length > 0 ) document.getElementById("item").focus();
}

//====================================================================================
// SelectOption: 
//====================================================================================
function SelectOption( parent_component, component, option ) {
	component.prev_data.push( component.data );
	component.prev_components.push( component.components );
	component.data = option;
	component.name = option.name;
	component.crafted = true;
	document.getElementById("item").blur();
	BuildUI( parent_component );
}


//====================================================================================
// SelectWildcard: 
//====================================================================================
function SelectWildcard( parent_component, wildcard_number, selected ) {
	parent_component.selectWildcard( wildcard_number, selected );
	parent_component.crafted = true;
	document.getElementById("item").blur();
	BuildUI( parent_component );
}

//====================================================================================
// HideOptions: 
//====================================================================================
function HideOptions() {
	document.getElementById("popup").style.opacity = 0.0;
	document.getElementById("popup").style.zIndex = -1;
	document.getElementById("close_popup").onclick = null;
	document.getElementById("close_popup").style.cursor = "default";
	document.getElementById("popup_content").innerHTML = "";
}

//====================================================================================
// Finalize: 
//====================================================================================
function Finalize( final_component ) {
	// Clear sidebar elements //
	document.getElementById("item_stats_title").innerHTML = final_component.name + " Statistics<hr\/>";
	document.getElementById("item_components_title").innerHTML = final_component.name + " Components<hr\/>";
	document.getElementById("item_resources_title").innerHTML = final_component.name + " Resources<hr\/>";
	document.getElementById("item_resources").innerHTML = "";
	document.getElementById("item_components").innerHTML = "";
	document.getElementById("item_resources").innerHTML = "";
	document.getElementById("item_stats").innerHTML = "";
	
	// Consolidate entire components list into temporary list //
	var components = [];
	for( var i = 0; i < window.components.length; i++ ) {
		components.push( [window.components[i], 1] );
	}
	for( var i = 0; i < components.length; i++ ) {
		for( var j = (i + 1); j < components.length; j++ ) {
			if( components[i][0].data.id === components[j][0].data.id ) {
				components.splice( j, 1 );
				components[i][1]++;
				j--;
			}
		}
	}
	
	// Store all stats for final item in temporary array //
	// Include final item in stat summation (primarily applies to components like metal bars, hide, etc.) //
	var all_stats = [];
	var stats = _stats[final_component.data.id];
	for( key in stats ) {
		for( var i = 0; i < Object.keys(stats).length; i++ ) {
			if( stats[key] ) {
				all_stats.push( [Object.keys(stats)[i], Number(stats[key])] );
			}
		}
	}
	
	// Iterate all components stored in global component list //
	for( var i = 0; i < components.length; i++ ) {
		var component = components[i][0];
		var quantity = components[i][1];
		
		// Add all component stats to final stats list //
		stats = _stats[component.data.id];
		for( key in stats ) {
			for( var j = 0; j < Object.keys(stats).length; j++ ) {
				if( stats[key] ) {
					all_stats.push( [Object.keys(stats)[j], Number(stats[key]) * quantity] );
				}
			}
		}
		
		// Display all components that are not basic resources in the "Components" sidebar //
		if( !component.resource ) document.getElementById("item_components").innerHTML += ("<img class=\"option_icon\" src=\"" + GetIcon( component.name, component.data, component.recipe ) + "\"\/>&nbsp;" + quantity + " x " + component.name + "<br/>");
		
		// Display all basic resources in the "Resources" sidebar //
		if( component.resource ) document.getElementById("item_resources").innerHTML += ("<img class=\"option_icon\" src=\"" + GetIcon( component.name, component.data, component.recipe ) + "\"\/>&nbsp;" + quantity + " x " + component.name + "<br/>");
	}
	
	// Consolidate and sum all stats for final item //
	for( var i = 0; i < all_stats.length; i++ ) {
		for( var j = (i + 1); j < all_stats.length; j++ ) {
			if( all_stats[i][0] === all_stats[j][0] ) {
				all_stats[i][1] += all_stats[j][1];
				all_stats.splice( j, 1 );
				j--;
			}
		}
	}
	
	// Display final item stats //
	for( var i = 0; i < all_stats.length; i++ ) {
		document.getElementById("item_stats").innerHTML += (all_stats[i][0] + ": +" + all_stats[i][1] + "<br/>");
	}
	
	// Display final item popup //
	document.getElementById("popup").style.opacity = 0.95;
	document.getElementById("popup").style.zIndex = 1;
	document.getElementById("close_popup").onclick = HideOptions;
	document.getElementById("close_popup").style.cursor = "pointer";
	document.getElementById("popup_icon").style.backgroundImage = "url( " + GetIcon( final_component.name, final_component.data, final_component.recipe ) + " )";
	document.getElementById("popup_title").innerHTML = final_component.name;
	document.getElementById("popup_content").innerHTML = "<hr\/><br\/>Total Yield: " + final_component.data.amount + " ea<br\/>Total Craft Time: " + final_component.data.time + " seconds<br\/>Crafting Success Chance: " + final_component.data.chance + "%<br\/>Crafting Difficulty: " + final_component.data.difficulty;
}