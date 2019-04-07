		<div class="errors"><?= validation_errors()?></div>
		<form action="" method="post">
			<table class="w3-table-all">
				<tr>
					<td>Item Name</td>
					<td><input name="name" value="<?= (isset($item->name))?$item->name:''?>" /></td>
				</tr>
				<tr>
					<td>Amount</td>
					<td><input name="amount" value="<?= (isset($item->amount))?$item->amount:''?>" /></td>
				</tr>
				<tr>
					<td>Difficulty</td>
					<td><input name="difficulty" value="<?= (isset($item->difficulty))?$item->difficulty:''?>" /></td>
				</tr>
				<tr>
					<td>Time</td>
					<td><input name="time" value="<?= (isset($item->time))?$item->time:''?>" /></td>
				</tr>
				<tr>
					<td>Chance</td>
					<td><input name="chance" value="<?= (isset($item->chance))?$item->chance:''?>" /></td>
				</tr>
				<tr>
					<td>Is Combonation of</td>
					<td>
						<select name="parent_id">
							<option value=-1>None</option>
							<?php foreach($parent_items as $p): ?>
							<option value="<?= $p->id?>"><?= $p->name?></option>
						<?php endforeach;?>
						</select>
					</td>
				</tr>
				<tr>
					<td>Category</td>
					<td>
						<select name="category">
						<?php foreach($categories as $cat): ?>
							<option value="<?= $cat->id?>"><?= $cat->name?></option>
						<?php endforeach;?>
						</select>
					</td>
				</tr>
				<tr>
					<td>Recipe Ingredients</td>
					<td>
						<table id="recipes">
							<tr>
								<th>Resource/Item</th>
								<th>Quantity</th>
								<th>Optional</th>
								<th>Wildcard</th>
								<th>Wildcard Result</th>
								<th>Material Index</th>
								<th></th>
							</tr>
							<?php foreach($item->recipe as $id => $rec):?>
							<tr>
								<td class="resource-type"><input type="hidden" name="material[<?=$id?>][reference_table]" value="<?=$rec->reference_table?>" />
									<select name="material[<?=$id?>][reference_id]">
									<optgroup label="resources">
										<?php foreach($resources as $res):
										$selected = "";
										if($rec->reference_table == "resources" && $rec->reference_id == $res->id)
											$selected = "SELECTED";
										?>
										<option value="<?=$res->id?>" <?=$selected?> ><?=$res->name?></option>
										<?php endforeach;?>
									</optgroup>
									<optgroup label="items">
										<?php foreach($items as $res):
										$selected = "";
										if($rec->reference_table == "items" && $rec->reference_id == $res->id)
											$selected = "SELECTED";
										?>
										<option value="<?=$res->id?>" <?=$selected?> ><?=$res->name?></option>
										<?php endforeach;?>
									</optgroup>
									</select>
								</td>
								<td><input type="number" name="material[<?=$id?>][quantity]" value=<?=$rec->quantity?> /></td>
								<td><input type="checkbox" name="material[<?=$id?>][is_optional]" <?= ($rec->is_optional)?"CHECKED":""?> /></td>
								<td><input type="checkbox" name="material[<?=$id?>][is_wildcard]" <?= ($rec->is_wildcard)?"CHECKED":""?> /></td>
								<td>
									<select name="material[<?=$id?>][wildcard_item_id]">
										<option value=-1>None</option>
									<?php foreach($wild_items as $res):?>
										<option value="<?=$res->id?>" <?= ($rec->wildcard_item_id == $res->id)?"SELECTED":""?>><?=$res->name?></option>
									<?php endforeach;?>
									</select>
								</td>
								<td><input type="number" name="material[<?=$id?>][material_idx]" max=3 value=<?=$rec->material_idx?> /></td>
								<td><button type="button" onclick="removeRow(this);">Remove</button></td>
							</tr>
							<?php endforeach;?>
						</table>
						<button type="button" id="add-material" onclick="addMaterial();">Add Material</button>
					</td>
				</tr>
				<tr>
					<td>Stats</td>
					<td>
						<table id="stats">
							<tr>
								<th>Stat</th>
								<th>Value</th>
								<th>Quality</th>
								<th></th>
							</tr>
							<?php foreach($item->stats as $id => $st):?>
							<tr>
								<td><?= $st->stat?></td>
								<td><?=$st->value?></td>
								<td><?php switch($st->quality):
									case 0:
										echo "Grey";
										break;
									case 1:
										echo "White";
										break;
									case 2:
										echo "Green";
										break;
									case 3:
										echo "Blue";
										break;
									case 4:
										echo "Purple";
										break;
									case 5:
										echo "Orange";
										break;
								endswitch;?>
								</td>
								<td><button type="button" onclick="removeRow(this);">Remove</button></td>
							</tr>
							<?php endforeach;?>
						</table>
						<button type="button" id="add-stat" onclick="addStat();">Add Stat</button>
					</td>
				</tr>
				<tr>
					<td colspan=2><button type=submit onclick="setReferenceTables();">Submit</button><button type=reset>Reset</button></td>
				</tr>
			</table>
		</form>
		<script type="text/javascript">
			var material_id = <?= count($item->recipe);?>;
			function addMaterial()
			{
				$('table#recipes').append('<tr>'+
								'<td class="resource-type"><input type="hidden" name="material['+(++material_id)+'][reference_table]" value="" />'+
									'<select name="material['+(material_id)+'][reference_id]">'+
									'<optgroup label="resources">'+
										'<?php foreach($resources as $res):?>'+
										'<option value="<?=$res->id?>"><?=$res->name?></option>'+
										'<?php endforeach;?>'+
									'</optgroup>'+
									'<optgroup label="items">'+
										'<?php foreach($items as $res):?>'+
										'<option value="<?=$res->id?>"><?=$res->name?></option>'+
										'<?php endforeach;?>'+
									'</optgroup>'+
									'</select>'+
								'</td>'+
								'<td><input type="number" name="material['+(material_id)+'][quantity]" value=1 /></td>'+
								'<td><input type="checkbox" name="material['+(material_id)+'][is_optional]" /></td>'+
								'<td><input type="checkbox" name="material['+(material_id)+'][is_wildcard]" /></td>'+
								'<td><select name="material['+(material_id)+'][wildcard_item_id]">'+
									'<option value=-1>None</option>'+
								'<?php foreach($wild_items as $res):?>'+
										'<option value="<?=$res->id?>"><?=$res->name?></option>'+
								'<?php endforeach;?>'+
								'</select></td>'+
								'<td><input type="number" name="material['+(material_id)+'][material_idx]" max=3 value='+material_id+' /></td>'+
								'<td><button type="button" onclick="removeRow(this);">Remove</button></td>'+
							'</tr>');
			}
			
			var stat_id = <?= count($item->stats);?>;
			function addStat()
			{
				$('table#stats').append(
					'<tr>'+
					'<td class="stat">'+
						'<select name="stat['+(++stat_id)+'][stat]">'+
							'<?php foreach($stats as $stat):?>'+
							'<option value="<?=$stat->name?>"><?=$stat->name?></option>'+
							'<?php endforeach;?>'+
						'</select>'+
					'</td>'+
					'<td><input name="stat['+stat_id+'][value]" value=0 /></td>'+
					'<td><select name="stat['+stat_id+'][quality]">'+
						'<option value=0>Grey</option>'+
						'<option value=1>White</option>'+
						'<option value=2>Green</option>'+
						'<option value=3>Blue</option>'+
						'<option value=4>Purple</option>'+
						'<option value=5>Orange</option>'+
					'</select></td>'+
					'<td><button type="button" onclick="removeRow(this);">Remove</button></td>'+
				'</tr>');
			}
			
			function removeRow(obj)
			{
				$(obj).parent().parent().remove();
			}
			
			function setReferenceTables()
			{
				$('.resource-type').each(function(){
					var reference_table = $(this).find('option:selected').parent().attr('label');
					$(this).find('input[type=hidden]').val(reference_table);
				});
			}
		</script>
	</body>
</html>