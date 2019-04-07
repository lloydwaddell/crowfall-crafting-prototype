<?php
	$this->load->view('dashboard/page_start_v');
	
	$this->load->view('dashboard/menu_v');
	
	$this->load->view($view,$content);
	
	$this->load->view('dashboard/page_end_v');