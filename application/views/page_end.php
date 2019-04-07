		</div>
		<script type="text/javascript">
			var _resources = <?= json_encode($resources);?>;
			var _items = <?= json_encode($items);?>;
			var _recipes = <?= json_encode($recipes);?>;
			var _stats = <?= json_encode($stats);?>;
			var _icons = <?php
				$files = [];
				foreach( glob( "./assets/img/icons/*.png" ) as $image ) {
					array_push( $files, $image );
				}
				echo json_encode($files);
			?>;
		</script>
		<script src="<?=base_url()?>assets/js/script.js"></script>
	</body>
	<footer></footer>
</html>