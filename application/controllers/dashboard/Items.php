<?php defined('BASEPATH') OR exit('No direct script access allowed');

Class Items extends CI_Controller
{
	function __construct()
	{
		parent::__construct();
		$this->load->model(array('items_m','stats_m','resources_m','categories_m','item_recipes_m','item_stats_m'));
		$this->load->library('form_validation');
	}
	
	function index()
	{
		$items = $this->items_m->get_all_extended();
		
		$arr_items = array();
		foreach($items as $item)
		{
			$row = (array)$item;
			$row['manage'] = anchor('dashboard/items/manage/'.$row['id'],'manage');
			unset($row['category_id']);
			unset($row['parent_id']);
			$arr_items[] = $row;
		}
			
		$this->load->library('table');
		$this->table->set_template(array('table_open' => '<table class="w3-table-all">'));
		
		$this->table->set_heading('id','name','amount','difficulty','time','chance','category','parent','manage');
		$data['content']['items'] = $arr_items;
		$data['view'] = 'dashboard/items_v';
		$this->load->view('dashboard/master_v',$data);
	}
	
	function add()
	{
		$this->form_validation->set_rules('name','Name','trim|required');
		$this->form_validation->set_rules('amount','Amount','intval|required');
		$this->form_validation->set_rules('time','Time','intval|required');
		$this->form_validation->set_rules('difficulty','Difficulty','intval|required');
		$this->form_validation->set_rules('chance','Chance','intval|required');
		$this->form_validation->set_rules('category','Category','intval|required');
		
		if($this->form_validation->run() !== false)
		{
			//Create Item Object and Insert
			$item = (object)[];
			$item->name = $this->input->post('name');
			$item->amount = $this->input->post('amount');
			$item->time = $this->input->post('time');
			$item->difficulty = $this->input->post('difficulty');
			$item->chance = $this->input->post('chance');
			$item->parent_id = ($this->input->post('parent_id') != -1)?$this->input->post('parent_id'):null;
			$item->category_id = $this->input->post('category');
			
			$item_id = $this->items_m->add($item);
			
			//Create Recipe Materials and Insert
			$material = (object)[];
			$material->item_id = $item_id;
			
			foreach((array)$this->input->post('material') as $mat)
			{
				$material->reference_table = $mat['reference_table'];
				$material->reference_id = intval($mat['reference_id']);
				$material->quantity = intval($mat['quantity']);
				$material->is_optional = (isset($mat['is_optional']))?1:0;
				$material->is_wildcard = (isset($mat['is_wildcard']))?1:0;
				$material->wildcard_item_id = ($material->is_wildcard && $mat['wildcard_item_id'] != -1)?$mat['wildcard_item_id']:null;
				$material->material_idx = intval($mat['material_idx']);
				
				$this->item_recipes_m->add($material);
			}
			
			//Create Stat and Insert
			$stat = (object)[];
			$stat->item_id = $item_id;
			
			foreach((array)$this->input->post('stat') as $s)
			{
				$stat->stat = $s['stat'];
				$stat->value = floatval($s['value']);
				$stat->quality = intval($s['quality']);
				
				$this->item_stats_m->add($stat);
			}
			
			redirect('dashboard/items/');
		}
		
		$content['parent_items'] = $this->items_m->get_parents();
		$content['items'] = $this->items_m->get(null,'`name` ASC');
		$content['wild_items'] = $this->items_m->get_wildcard_items();
		$content['categories'] = $this->categories_m->get(null,'`name` ASC');
		$content['resources'] = $this->resources_m->get();
		$content['stats'] = $this->stats_m->get();
		
		$data['content'] =& $content;
		$data['view'] = 'dashboard/items_add_v';
		$this->load->view('dashboard/master_v',$data);
	}
	
	function manage($id)
	{
		
		$item = $this->items_m->get($id)[0];
		$item->recipe = (array)$this->item_recipes_m->get_by_item_id($id);
		$item->stats = (array)$this->item_stats_m->get_by_item_id($id);
		
		$content['item'] = $item;
		$content['parent_items'] = $this->items_m->get_parents();
		$content['items'] = $this->items_m->get(null,'`name` ASC');
		$content['wild_items'] = $this->items_m->get_wildcard_items();
		$content['categories'] = $this->categories_m->get(null,'`name` ASC');
		$content['resources'] = $this->resources_m->get();
		$content['stats'] = $this->stats_m->get();
		
		$data['content'] =& $content;
		$data['view'] = 'dashboard/items_manage_v';
		$this->load->view('dashboard/master_v',$data);
	}
	
}