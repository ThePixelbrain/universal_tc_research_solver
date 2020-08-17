function best_aspect(starting_cell_id, target_cell_id, neighbor_cell_id, state) {
		var starting_cell = get_cell_by_id(starting_cell_id, state.grid);
		var target_cell = get_cell_by_id(target_cell_id, state.grid);
		var neighbor_cell = get_cell_by_id(neighbor_cell_id, state.grid);

		var least_complex_aspect = null;
		var current_complexity = null;

		/* small complexity < being linked to target cell */
		if (aspect_table[starting_cell.aspect].length == 1) {
			/* primal aspect, must choose compound that includes it */
			/* trying to have smallest complexity */
			/* and then search again to see i we can get something directly related */
			for (var i = 0; i < keylen(aspect_table); i++) {
				if (can_use_aspect(neighbor_cell_id, keyAtIndex(aspect_table, i), state) && least_complex_aspect == null) {
					if (contains(keyAtIndex(aspect_table, i), starting_cell.aspect) > -1) {
						least_complex_aspect = keyAtIndex(aspect_table, i); //aspect_table[starting_cell.aspect][contains(keyAtIndex(aspect_table, i), starting_cell.aspect)];
						current_complexity = complexity(least_complex_aspect);
					}
				} else {
					if (can_use_aspect(neighbor_cell_id, keyAtIndex(aspect_table, i), state) && contains(keyAtIndex(aspect_table, i), starting_cell.aspect) > -1) {
						var temp_aspect = keyAtIndex(aspect_table, i);//aspect_table[starting_cell.aspect][contains(keyAtIndex(aspect_table, i), starting_cell.aspect)];
						if (current_complexity > complexity(temp_aspect)) {
							least_complex_aspect = keyAtIndex(aspect_table, i);//aspect_table[starting_cell.aspect][contains(keyAtIndex(aspect_table, i), starting_cell.aspect)];
							current_complexity = complexity(least_complex_aspect);
						}
					}
				}
			}
			/* trying to match a bit the target aspect */
			for (var i = 0; i < keylen(aspect_table); i++) {
				if (can_use_aspect(neighbor_cell_id, keyAtIndex(aspect_table, i), state) && contains(keyAtIndex(aspect_table, i), starting_cell.aspect) > -1) {
					if ((current_complexity == complexity(temp_aspect) || Math.abs(current_complexity - complexity(temp_aspect)) == 1) && (contains(temp_aspect, target_cell.aspect) || contains(target_cell.aspect, temp_aspect))) {
						least_complex_aspect = temp_aspect;
						current_complexity = complexity(temp_aspect);
					}
				}
			}
		} else if (aspect_table[starting_cell.aspect].length == 2) {
			/* compound aspect */
			for (var i = 0; i < keylen(aspect_table); i++) {
				if (least_complex_aspect == null) {
					if (can_use_aspect(neighbor_cell_id, keyAtIndex(aspect_table, i), state) && contains(starting_cell.aspect, keyAtIndex(aspect_table, i)) > -1) {
						least_complex_aspect = keyAtIndex(aspect_table, i); //aspect_table[starting_cell.aspect][contains(keyAtIndex(aspect_table, i), starting_cell.aspect)];
						current_complexity = complexity(least_complex_aspect);
					}
				} else {
					if (can_use_aspect(neighbor_cell_id, keyAtIndex(aspect_table, i), state) && contains(starting_cell.aspect, keyAtIndex(aspect_table, i)) > -1) {
						var temp_aspect = keyAtIndex(aspect_table, i);//aspect_table[starting_cell.aspect][contains(keyAtIndex(aspect_table, i), starting_cell.aspect)];
						if (current_complexity > complexity(temp_aspect)) {
							least_complex_aspect = keyAtIndex(aspect_table, i);//aspect_table[starting_cell.aspect][contains(keyAtIndex(aspect_table, i), starting_cell.aspect)];
							current_complexity = complexity(least_complex_aspect);
						}
					}
				}
			}
			for (var i = 0; i < keylen(aspect_table); i++) {
				if (can_use_aspect(neighbor_cell_id, keyAtIndex(aspect_table, i), state) && contains(starting_cell.aspect, keyAtIndex(aspect_table, i)) > -1) {
					if ((current_complexity == complexity(temp_aspect) || Math.abs(current_complexity - complexity(temp_aspect)) == 1) && (contains(temp_aspect, target_cell.aspect) || contains(target_cell.aspect, temp_aspect))) {
						least_complex_aspect = temp_aspect;
						current_complexity = complexity(temp_aspect);
					}
				}
			}
		}
		return least_complex_aspect;
	}



function assign_aspect() {
		if (selected_cell != undefined) {
			selected_cell.aspect = document.getElementById('aspect_selector').value;
			if (selected_cell.aspect != 'none') {
				var img = new Image();
				img.onload = function() {
					console.debug("loading aspect img"); 
				}
				img_size = selected_cell.side_len / 1.5;
				img.src = './hq_aspect_images_black/thaumcraft/' + selected_cell.aspect + '.png';
				image_cache[selected_cell.aspect] = img;
				selected_cell.img = image_cache[selected_cell.aspect];
				img.addEventListener("load", function () {
					draw_grid(grid);
				});
			} else {
				draw_grid(grid);
			}
		}
	}

function closest_cells(state) {
		/* basically take every cell and get all distances to all other cells */
		/* uses precalculated values */
		/* ignores cells that form a continuity */
		var current_closest_pair = [];
		for (var i = 0; i < state.grid.length; i++) {
			for (var j = 0; j < state.grid[i].length; j++) {
				/* check that the cell has an aspect and not in blacklist*/
				if (state.grid[i][j].aspect != 'none' && !impossible_id(state.grid[i][j].id, state)) {
					var current_neighbor_chain = neighbor_chain(i, j, state.grid);
					for (var k = 0; k < keylen(distance_dict[state.grid[i][j].id]); k++) {
						/* check if the cell isn't already connected */
						var in_neighbor_chain = false;
						for (var l = 0; l < current_neighbor_chain.length; l++) {
							/*if (state.grid[current_neighbor_chain[l][0]][current_neighbor_chain[l][1]].id == parseInt(keyAtIndex(distance_dict[state.grid[i][j].id], k))) {
								in_neighbor_chain = true;
							}*/
							if (inArray(current_neighbor_chain, [parseInt(keyAtIndex(distance_dict[state.grid[i][j].array_x], k)), parseInt(keyAtIndex(distance_dict[state.grid[i][j].array_y], k))])) {
								in_neighbor_chain = true;
							}
						}
						if (!in_neighbor_chain && get_cell_by_id(parseInt(keyAtIndex(distance_dict[state.grid[i][j].id], k)), state.grid).aspect != 'none' && !impossible_id(get_cell_by_id(parseInt(keyAtIndex(distance_dict[state.grid[i][j].id], k)), state.grid).id, state)) {
							if (current_closest_pair.length == 0) {
								current_closest_pair = [state.grid[i][j].id, parseInt(keyAtIndex(distance_dict[state.grid[i][j].id], k))];
							} else {
								var current_distance = get_distance(get_cell_by_id(current_closest_pair[0], state.grid).x, get_cell_by_id(current_closest_pair[0], state.grid).y, get_cell_by_id(current_closest_pair[1], state.grid).x, get_cell_by_id(current_closest_pair[1], state.grid).y);
								var potential_distance = get_distance(state.grid[i][j].x, state.grid[i][j].y, get_cell_by_id(parseInt(keyAtIndex(distance_dict[state.grid[i][j].id], k)), state.grid).x, get_cell_by_id(parseInt(keyAtIndex(distance_dict[state.grid[i][j].id], k)), state.grid).y);
								if (potential_distance < current_distance) {
									current_closest_pair = [state.grid[i][j].id, parseInt(keyAtIndex(distance_dict[state.grid[i][j].id], k))];
								}
							}
						}
					}
				}
			}
		}
		return current_closest_pair;
	}






	//============================================================================================================================================================



if (current_state.last_cell) {
	var temp_aspect = get_cell_by_id(current_state.last_cell, current_state.grid).aspect;
	state_history.pop();
	if (state_history.length <= 0) {
			current_state.current_path = null;
			state_history.push(deepcopy(original_state));
			if (current_path) {
				/* EXPERIMENTAL */
				state_history[state_history.length - 1].blacklisted_paths.push(current_path);
				state_history[state_history.length - 1].current_path = null;
				state_history[state_history.length - 1].impossible_aspects_for_current_path = null;
				current_path = null;
			}
	}
	if (every_aspect_tried_for_path(current_state.path, current_state)) {
		state_history[state_history.length - 1].blacklisted_paths.push(current_path);
		state_history[state_history.length - 1].current_path = null;
		state_history[state_history.length - 1].impossible_aspects_for_current_path = null;
		current_path = null;
	}
	blacklist_aspect(current_state.last_cell, get_cell_by_id(current_state.last_cell, current_state.grid).aspect, state_history[state_history.length - 1]);
	current_state = deepcopy(state_history[state_history.length - 1]);
	returning_from_bad_state = false;
	} else {
		/* checking if possibilities are exhausted, for now it's only to know if we */
		/* can get a closest cells pair + a cell between */
		var temp_closest_cells = closest_cells(current_state);
		if (temp_closest_cells.length > 0) {
			var first_cell = get_cell_by_id(temp_closest_cells[0], current_state.grid);
			var second_cell = get_cell_by_id(temp_closest_cells[1], current_state.grid);
			var closest_neighbor = get_cell_by_id(closest_neighbor_to_cell(first_cell.id, second_cell.id, current_state, current_state.current_path), current_state.grid);
			/* check if there exists a cell near to both */
			if (closest_neighbor) {
				/* tests passed, simply adding first cell from the 2 last touched to blacklist */
				var temp_aspect = get_cell_by_id(current_state.last_cell2, current_state.grid).aspect;
				if (temp_aspect) {
					blacklist_aspect(current_state.last_move[0], get_cell_by_id(current_state.last_move[0], current_state.grid).aspect, current_state);//current_state.impossible_closest_cells[current_state.last_move[0]] = get_cell_by_id(current_state.last_move[0]).aspect;//.push(current_state.last_move[0]);
				} else {
					/* H I G H L Y  E X P E R I M E N T A L */
					state_history.pop();
					if (state_history.length <= 0) {
							current_state.current_path = null;
							state_history.push(deepcopy(original_state));
							if (current_path) {
								/* EXPERIMENTAL */
								state_history[state_history.length - 1].blacklisted_paths.push(current_path);
								state_history[state_history.length - 1].current_path = null;
								state_history[state_history.length - 1].impossible_aspects_for_current_path = null;
								current_path = null;
							}
					}
					if (every_aspect_tried_for_path(current_state.path, current_state)) {
						state_history[state_history.length - 1].blacklisted_paths.push(current_path);
						state_history[state_history.length - 1].current_path = null;
						state_history[state_history.length - 1].impossible_aspects_for_current_path = null;
						current_path = null;
					}
					blacklist_aspect(current_state.last_cell2, get_cell_by_id(current_state.last_cell2, current_state.grid).aspect, state_history[state_history.length - 1]);
					current_state = deepcopy(state_history[state_history.length - 1]);
					returning_from_bad_state = false;
				}						
			}  else {
				//temp_blacklisted_cell_id = 
				state_history.pop();
				if (state_history.length <= 0) {
					current_state.current_path = null;
					state_history.push(deepcopy(original_state));
				}
				blacklist_aspect(current_state.last_move[0], get_cell_by_id(current_state.last_move[0], current_state.grid).aspect, state_history[state_history.length - 1]);//state_history[state_history.length - 1].impossible_closest_cells[current_state.last_move[0]] = get_cell_by_id(current_state.last_move[0]).aspect;//.push(current_state.last_move[0]);
				current_state = deepcopy(state_history[state_history.length - 1]);
				returning_from_bad_state = false;
			}
		} else {
			//temp_blacklisted_cell_id = 
			state_history.pop();
			if (state_history.length <= 0) {
					current_state.current_path = null;
					state_history.push(deepcopy(original_state));
			}
			blacklist_aspect(current_state.last_move[0], get_cell_by_id(current_state.last_move[0], current_state.grid).aspect, state_history[state_history.length - 1]);//state_history[state_history.length - 1].impossible_closest_cells[current_state.last_move[0]] = get_cell_by_id(current_state.last_move[0]).aspect;//.push(current_state.last_move[0]);
			current_state = deepcopy(state_history[state_history.length - 1]);
			returning_from_bad_state = false;
		}
	}
}














//=============================




function main_loop(){
	if (depth == 170) {
		console.log("debug");
	}
	//var used_grid = deepcopy(current_state.grid);
	console.log(`entering depth ${depth}`);
	depth++;
	draw_grid(current_state.grid);
	//draw_debug_grid(current_state.grid);
	//draw_grid(used_grid);
	if (check_continuity(current_state.grid)) {
	//if (check_continuity(used_grid)) {
		solved = true;
		console.log("==============\nS O L V E D\n==============");
	}
	if (!returning_from_bad_state) {
		console.log(`Not returning from bad state`);//, grid: ${used_grid}`);
		//console.log(`impossible moves: ${current_state.impossible_closest_cells}`);
		/* should choose two closest base cells and try to connect them. */
		/* if the algo exhausts ways to try to directly connect two cells */
		/* it should try to connect 2 other cells (on edges). */
		/* or maybe it should just try to connect 2 closest cells? */
		/* 2 closest cells: */
		var temp_closest_cells = closest_cells(current_state);
		
		if (temp_closest_cells.length > 0) {
			if (current_state.current_path && path_complete(current_state.current_path, current_state)) {
				current_state.current_path = null;
			}
			if (!current_state.current_path) {
				current_path = find_path(temp_closest_cells[0], temp_closest_cells[1], current_state);
				current_state.current_path = deepcopy(current_path);
			}
			var first_cell = get_cell_by_id(temp_closest_cells[0], current_state.grid); //used_grid);
			var second_cell = get_cell_by_id(temp_closest_cells[1], current_state.grid);
			if (current_path) {
				//current_state.current_path = deepcopy(current_path);
				current_state.last_move = [first_cell.id, second_cell.id];
				/* then, determine the first cells neighbor that itself is closest to the second cell */
				var closest_neighbor = get_cell_by_id(closest_neighbor_to_cell(first_cell.id, second_cell.id, current_state, current_path), current_state.grid);
				if (closest_neighbor) {
					//var closest_neighbor_id = closest_neighbor.id;//closest_neighbor_to_cell(temp_closest_cells[0], temp_closest_cells[1], current_state.grid);
					//var closest_neighbor = get_cell_by_id(closest_neighbor_id, grid);
					var temp_best_aspect = best_aspect(first_cell.id, second_cell.id, closest_neighbor.id, current_state);
					if (temp_best_aspect) {
						closest_neighbor.aspect = temp_best_aspect;
						grid = current_state.grid;
						//current_state.current_path = null;
						state_history.push(deepcopy(current_state));
					} else {
						returning_from_bad_state = true;
						current_state.bad_state_reason = 'no_aspect';
						//EXPERIMENTAL
						//current_state.last_cell = first_cell.id;
					}
				} else {
					/* if no closest cell is available, blacklist that connection. */
					/* while the connection of two cells is blacklisted, they can not be elected */
					/* as two closest cells. Voilà*/ /* hmmm */
					returning_from_bad_state = true;
					current_state.bad_state_reason = 'no_neighbor';
					//last_touched_cells = [first_cell.id, second_cell.id];
					/* mark the connection somehow, so next main_loop will blacklist it, after */
					/* having popped state history */
				}
			} else {
				returning_from_bad_state = true;
				current_state.bad_state_reason = 'no_path';
				if (current_state.current_path && every_aspect_tried_for_path(current_state.current_path, current_state)) {
					current_state.blacklisted_paths.push(current_state.current_path);
					current_state.impossible_closest_cells = {};
					current_state = null;
					current_state.current_path = null;
					current_state.impossible_aspects_for_current_path = {};
					current_state.current_path_child_dict = {};
					current_state.current_path_child_blacklist = {};
					current_state.current_path_forbidden_child = null;
				} else {
					current_state.last_cell = first_cell.id;
					current_state.last_cell2 = first_cell.id;
				}
			}
		} else {
			returning_from_bad_state = true;
			/* mark last added cell as impossible move */
			/* for now maybe only the first cell of the closest cells */
		}
		
		
	} else {
		console.log(`Returning from bad state`);//, grid: ${used_grid}`);
		console.log(`last_touched_cells: ${last_touched_cells}`)
		/* if possibilities for current state exhausted, remove it from state_history */
		/* add last move to the now last state in history */
		/* only adding the first cell should work. Should */
		}}


	//console.debug(`${}`)





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function find_path(id1, id2, state) {
	let grid = state.grid;
	let cell1 = get_cell_by_id(id1, grid);
	let cell2 = get_cell_by_id(id2, grid);
	let path_blacklist = state.blacklisted_paths;
	let res = [id1];
	let path_found = false;
	let path_depth = 0;
	let cell_blacklist = [];
	let path_last_move;
	let current_blacklisted_path_id;
	let cell_blacklist_for_current_path = [];
	while(!path_found) {
		path_depth++;
		if (path_depth == 1000) {
			return null;
		}
		//let path_closest_neighbor = get_cell_by_id(closest_neighbor_to_cell(res[res.length - 1], id2, grid, cell_blacklist), grid);
		let path_closest_neighbor = get_cell_by_id(closest_neighbor_to_cell(res[res.length - 1], id2, state), grid);
		if (path_closest_neighbor) {
			res.push(path_closest_neighbor.id);
			//get_cell_by_id(res[res.length - 1], grid).child = path_closest_neighbor.id;
			state.current_path_child_dict[res[res.length - 2]] = path_closest_neighbor.id;
			let grid_copy = deepcopy(grid);
			for (let i = 0; i < grid_copy.length; i++) {
				for (let j = 0; j < grid_copy[i].length; j++) {
					if (!res.includes(grid_copy[i][j].id) && grid_copy[i][j].id != id2) {
						grid_copy[i][j].barred = true;
					}
				}
			}
			if (inArray(neighbor_chain(cell1.array_x, cell1.array_y, grid_copy, true), [cell2.array_x, cell2.array_y])) {
				res.push(id2);
				let same = false;
				for (let i = 0; i < path_blacklist.length; i++) {
					if (arrays_equal(path_blacklist[i], res)) {
						same = true;
						current_blacklisted_path_id = i;
						break;
					}
				}
				if (!same) {
					path_found = true;
				} else {
					//if (cell_blacklist.length ) {}
					cell_blacklist.push(path_blacklist[current_blacklisted_path_id][already_blacklisted_cells_from_path(path_blacklist[current_blacklisted_path_id], cell_blacklist) + 1]);
					cell_blacklist_for_current_path[0] = cell_blacklist[cell_blacklist.length - 1];
					state.current_path_forbidden_child = {};
					state.current_path_forbidden_child[cell_blacklist_for_current_path[0]] = state.current_path_child_dict[cell_blacklist_for_current_path[0]];
					res = [id1];
				}
			}
			grid_copy = null;
		} else {
			return null;
		}
	}
	return res;
}