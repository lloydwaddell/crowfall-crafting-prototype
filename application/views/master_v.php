<?php
	$this->load->view('page_start');
	
	$this->load->view('crafting_menu_v',$content);
		
	$this->load->view($view,$content);
	
	$this->load->view('page_end',$content);
?>