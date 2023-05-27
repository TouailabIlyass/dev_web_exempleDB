<?php

// Database connection parameters
$host = '127.0.0.1';
$db_name = 'dev_web';
$username = 'dev';
$password = 'dev';

// Establish database connection
try {
  $db = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  echo "Database connection failed: " . $e->getMessage();
  exit;
}

// Set the response header
header('Content-Type: application/json');

// Handle the CRUD operations
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Create a product
  $data = json_decode(file_get_contents('php://input'), true);
  $name = $data['name'];
  $description = $data['description'];
  $price = $data['price'];

  // Insert the product into the database
  $stmt = $db->prepare("INSERT INTO products (name, price,description) VALUES (?, ?,?)");
  $stmt->execute([$name, $price,$description]);
  
  // Get the last inserted product ID
  $product_id = $db->lastInsertId();

  echo json_encode(array('message' => 'Product created', 'product_id' => $product_id));
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
  // Read all products
//   $stmt = $db->query("SELECT * FROM products");
//   $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
//   echo json_encode($products);
// Get the current page number
$page = isset($_GET['page']) ? $_GET['page'] : 1;

// Set the number of products per page
$limit = 10;

// Calculate the offset
$offset = ($page - 1) * $limit;

// Query to retrieve products with pagination
$stmt = $db->prepare("SELECT * FROM products LIMIT :limit OFFSET :offset");
$stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
$stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get the total number of products
$stmt = $db->prepare("SELECT COUNT(*) AS total FROM products");
$stmt->execute();
$totalProducts = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

// Calculate the total number of pages
$totalPages = ceil($totalProducts / $limit);

// Prepare the response data
$responseData = [
  'products' => $products,
  'total_pages' => $totalPages,
  'current_page' => $page
];

// Send the response as JSON
header('Content-Type: application/json');
echo json_encode($responseData);

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
  // Update a product
  $data = json_decode(file_get_contents('php://input'), true);
  $id = $data['id'];
  $name = $data['name'];
  $description = $data['description'];
  $price = $data['price'];

  // Update the product in the database
  $stmt = $db->prepare("UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?");
  $stmt->execute([$name, $price, $description, $id]);

  echo json_encode(array('message' => 'Product updated','success'=>true));
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  // Delete a product
  $data = json_decode(file_get_contents('php://input'), true);
  $id = $data['id'];

  // Delete the product from the database
  $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
  $stmt->execute([$id]);

  echo json_encode(array('message' => 'Product deleted','success'=>true));
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
  // Read a single product
  $id = $_GET['id'];

  // Fetch the product from the database
  $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
  $stmt->execute([$id]);
  $product = $stmt->fetch(PDO::FETCH_ASSOC);

  echo json_encode($product);
} else {
  echo json_encode(array('message' => 'Invalid request'));
}
