<?php defined('BASEPATH') OR exit('No direct script access allowed');

Class CF_Controller extends CI_Controller
{
	public $content = array();
	function __construct()
	{
		parent::__construct();
		$this->load->model(array('categories_m','resources_m','items_m', 'item_recipes_m','item_stats_m'));
		
		foreach($this->categories_m->get(null,'`parent_id` ASC, `name` ASC') as $cat)
		{
			if($cat->name == 'Wildcard_Items')
				continue;
			
			if(is_null($cat->parent_id))
				$this->content['categories'][$cat->id]['category'] = $cat;
			else
				$this->content['categories'][$cat->parent_id]['subcategories'][] = $cat;
		}
		
		foreach($this->resources_m->get() as $res)
			$this->content['resources'][$res->id] = $res;
		
		foreach($this->items_m->get() as $item)
		{
			if(is_null($item->parent_id))
			{
				$this->content['cat_items'][$item->category_id][] = $item->id;
				$this->content['items'][$item->id] = $item;
			}
			else
				$this->content['items'][$item->id]->combinations[] = $item;
		}
		
		foreach($this->item_recipes_m->get() as $rec_item)
		{
			$this->content['recipes'][$rec_item->item_id][] = $rec_item;
		}
		
		foreach($this->item_stats_m->get() as $item_stat)
		{
			$this->content['stats'][$item_stat->item_id][$item_stat->stat][$item_stat->quality] = $item_stat->value;
		}
		
	}
}