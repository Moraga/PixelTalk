<?php

if (empty($_SERVER['HTTP_REFERER'])) {
	header('Content-Type: text/html; charset=utf-8', true, 404);
	exit;
}

// settings
ini_set('date.timezone', 'America/Sao_Paulo');
ini_set('display_errors', true);
ini_set('mongo.native_long', 0);

$url = $_SERVER['HTTP_REFERER'];
$doc = (new MongoClient)->pixeltalk->page->findOne(['url' => $url]);

echo $doc ? json_encode($doc['log']) : 'null';