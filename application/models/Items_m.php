<?php defined('BASEPATH') OR exit('No direct script access allowed');
/**
	Items
		ID
		Name
		Amount
		Difficulty
		Time
		Chance
		Parent_ID - signifies item is a combination of another item (ex. copper bar is a metal bar)
		Category_ID
*/
Class Items_m extends CF_Model
{
	function __construct()
	{
		parent::__construct();
		$this->order_by = '`category_id` ASC, `parent_id` ASC, `name` ASC';
	}
	
	function get_all_extended()
	{
		$this->db->join('categories c','c.id = items.category_id','left');
		$this->db->join('items i','i.id = items.parent_id','left');
		
		$this->db->select('items.*, c.name `category`, i.name `parent`');
		$this->db->order_by($this->order_by);
		$query = $this->db->get($this->table);
		return $query->result();
	}
	
	function get_wildcard_items()
	{
		$this->db->where('category_id',23);
		$this->db->order_by('`name` ASC');
		$query = $this->db->get($this->table);
		return $query->result();
	}
	
	function get_parents()
	{
		$this->db->where('parent_id IS NULL');
		$this->db->order_by('`name` ASC');
		$query = $this->db->get($this->table);
		return $query->result();
	}
}