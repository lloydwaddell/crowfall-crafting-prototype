<?php defined('BASEPATH') OR exit('No direct script access allowed');

Class CF_Model extends CI_Model
{
	protected $table;
	protected $order_by = '`name` ASC';
	
	function __construct()
	{
		$this->table = strtolower(str_replace('_m','', get_class($this)));
	}
	
	function add($object)
	{
		$this->db->insert($this->table,$object);
		return $this->db->insert_id();
	}
	
	function get($id = null)
	{
		if($id)
			$this->db->where('id',$id);
		
		$this->db->order_by($this->order_by);
		$query = $this->db->get($this->table);
		return $query->result();
	}
	
	
}