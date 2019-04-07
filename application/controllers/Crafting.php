<?php defined('BASEPATH') OR exit('No direct script access allowed');

Class Crafting extends CF_Controller
{
	function __construct()
	{
		parent::__construct();
	}
	
	function index()
	{
		$content =& $this->content;
		
		$view = array('view' => 'crafting_v');
		$view['content'] = $content;
		$this->load->view('master_v',$view);
	}
}