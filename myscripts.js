// Helper function to display the product list
function displayProductList(products) {
  var productList = document.getElementById('productList');
  productList.innerHTML = '';

  if (products.length === 0) {
    productList.innerHTML = '<p>No products found.</p>';
    return;
  }

  var table = document.createElement('table');
  table.className = 'table';

  var tableHead = document.createElement('thead');
  tableHead.innerHTML = '<tr><th>ID</th><th>Name</th><th>Price</th><th>description</th></tr>';
  table.appendChild(tableHead);

  var tableBody = document.createElement('tbody');

  products.forEach(function(product) {
    var row = document.createElement('tr');
    row.innerHTML = `<td> ${product.id} </td><td> ${product.name} </td><td> ${product.price} </td><td> ${product.description} </td>
    <td><button class="btn btn-primary" onclick="openUpdateProductModal('${product.id}','${product.name}','${product.price}','${product.description}')">Update</button></td>
    <td><button class="btn btn-danger" onclick="deleteProduct('${product.id}')">Delete</button></td>`;
    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  productList.appendChild(table);
}

// Helper function to display the pagination links
function displayPagination(totalPages, currentPage) {
  var pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  for (var i = 1; i <= totalPages; i++) {
    var listItem = document.createElement('li');
    listItem.className = 'page-item' + (i === currentPage ? ' active' : '');
    listItem.innerHTML = '<a class="page-link" href="#" data-page="' + i + '">' + i + '</a>';

    pagination.appendChild(listItem);
  }

  // Add event listener to each pagination link
  var pageLinks = pagination.getElementsByClassName('page-link');
  Array.from(pageLinks).forEach(function(link) {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      var page = parseInt(this.getAttribute('data-page'));
      fetchProducts(page);
    });
  });
}

// Fetch products with pagination
function fetchProducts(page) {
  fetch('api.php?page=' + page)
    .then(response => response.json())
    .then(responseData => {
      var products = responseData.products;
      var totalPages = responseData.total_pages;
      var currentPage = responseData.current_page;

      displayProductList(products);
      displayPagination(totalPages, currentPage);
    })
    .catch(error => {
      console.log(error);
    });
}

// Helper function to open the update product modal
function openUpdateProductModal(id,name,price, description) {
  document.getElementById('productId').value = id;
  document.getElementById('productName').value = name;
  document.getElementById('productPrice').value = price;
  document.getElementById('productDescription').value = description;

  var updateProductModal = new bootstrap.Modal(document.getElementById('updateProductModal'));
  updateProductModal.show();
}

// Handle update product form submission
document.getElementById('updateProductForm').addEventListener('submit', function(event) {
  event.preventDefault();

  let productId = document.getElementById('productId').value;
  let productName = document.getElementById('productName').value;
  let productPrice = document.getElementById('productPrice').value;
  let productDescription = document.getElementById('productDescription').value;

  // Prepare the request data
  let requestData = {
    id: productId,
    name: productName,
    price: productPrice,
    description: productDescription
  };

  // Send the update request
  fetch('api.php', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  })
    .then(response => response.json())
    .then(responseData => {
      // Check if the update was successful
      if (responseData.success) {
        // Refresh the product list
        fetchProducts(1);
        // Close the update product modal
        let updateProductModal = new bootstrap.Modal(document.getElementById('updateProductModal'));
        updateProductModal.hide();
      } else {
        alert('Failed to update product.');
      }
    })
    .catch(error => {
      console.log(error);
    });
});


// Delete Product
function deleteProduct(id) {
  // Display the delete confirmation modal
  var deleteProductModal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
  deleteProductModal.show();

  // Handle the delete confirmation
  document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    // Send the delete request
    fetch('api.php', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id:id})
    })
      .then(response => response.json())
      .then(responseData => {
        // Check if the delete was successful
        if (responseData.success) {
          // Refresh the product list
          fetchProducts(1);
          // Close the delete product modal
          deleteProductModal.hide();
        } else {
          alert('Failed to delete product.');
        }
      })
      .catch(error => {
        console.log(error);
      });
  });
}

// Handle form submission
document.getElementById('addProductForm').addEventListener('submit', function(event) {
  event.preventDefault();

  // Get form values
  let name = document.getElementById('name').value;
  let description = document.getElementById('description').value;
  let price = parseFloat(document.getElementById('price').value);

  // Create a product
  fetch('api.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: name, description: description, price: price })
  })
    .then(response => response.json())
    .then(responseData => {
      fetchProducts(1);
    })
    .catch(error => {
      console.log(error);
    });

  // Reset form
  this.reset();
});


fetchProducts(1);