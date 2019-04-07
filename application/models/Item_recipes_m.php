<?php defined('BASEPATH') OR exit('No direct script access allowed');
/*	Item_Recipe
		Item_ID
		Reference_Table - whether material is a resource or item
		Reference_ID
		material_idx - wildcard materials will have the same idx
		Is_Optional
		Is_wildcard
		wildcard_item_id
		quantity
*/
Class Item_recipes_m extends CF_Model
{
	function __construct()
	{
		parent::__construct();
		$this->order_by = '`item_id` ASC, `material_idx` ASC';
	}
	
	function get_by_item_id($id)
	{
		$this->db->where('item_id',$id);
		$this->db->order_by('`material_idx` ASC');
		$query = $this->db->get($this->table);
		return $query->result();
	}
}