<?php

if (empty($_SERVER['HTTP_REFERER'])) {
	header('Content-Type: text/html; charset=utf-8', true, 404);
	exit;
}

// settings
ini_set('date.timezone', 'America/Sao_Paulo');
ini_set('display_errors', true);
ini_set('mongo.native_long', 0);

$col = (new MongoClient)->pixeltalk->page;
$url = $_SERVER['HTTP_REFERER'];
$doc = $col->findOne(['url' => $url]);

// fix numbers
$_POST = json_decode(json_encode($_POST, JSON_NUMERIC_CHECK));

// update
if ($doc) {
	$col->update(['_id' => $doc['_id']], ['$set' => ['log' => $_POST]]);
}
else {
	$col->insert([
		'url' => $url,
		'log' => $_POST,
	]);
}

?>