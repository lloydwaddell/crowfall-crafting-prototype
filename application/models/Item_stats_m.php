<?php defined('BASEPATH') OR exit('No direct script access allowed');
/*	Item_Stats
		Stat
		Item_ID
		Qaulity
		Value
*/
Class Item_stats_m extends CF_Model
{
	function __construct()
	{
		parent::__construct();
		$this->order_by = '`item_id` ASC, `stat` ASC';
	}
	
	function get_by_item_id($id)
	{
		$this->db->where('item_id',$id);
		$this->db->order_by('`stat` ASC');
		$query = $this->db->get($this->table);
		return $query->result();
	}
}