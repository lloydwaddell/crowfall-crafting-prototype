			<div id="crafting-categories">
			<?php
			foreach($categories as $cat): ?>
				<h3><?= $cat['category']->name?></h3>
				<div data-cf-cat="<?= $cat['category']->name?>" class="crafting-cat crafting-subcategories">
				<?php
				if(isset($cat['subcategories'])):
					foreach($cat['subcategories'] as $sub): ?>
					<h3><?= $sub->name?></h3>
					<div data-cf-subcat="<?= $sub->name?>" class="crafting-subcat">
					<?php if(isset($cat_items[$sub->id])):
						foreach((array)$cat_items[$sub->id] as $item_id): ?>
						<div data-cf-item="<?= $item_id?>" class="crafting_item"><?= $items[$item_id]->name?></div>
					<?php endforeach;
					endif;
					?>
					</div>
				<?php endforeach;
				else:
				?>
					<h3>Items</h3>
					<div class="crafting-subcat">
					<?php if(isset($cat_items[$cat['category']->id])):
						foreach($cat_items[$cat['category']->id] as $item): ?>
						<div data-cf-item="<?= $item?>" class="crafting_item"><?= $items[$item]->name?></div>
					<?php endforeach;
					endif;
					?>
					</div>
				<?php endif;?>
				</div>
			<?php endforeach;?>
			</div>