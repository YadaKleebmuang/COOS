const products = [
  { id: 1, name: 'Product 1', price: 100 },
  { id: 2, name: 'Product 2', price: 200 },
];

function findAll() {
  return products;
}

function findById(id) {
  return products.find(p => p.id === id);
}

function create(product) {
  products.push(product);
  return product;
}

module.exports = {
  findAll,
  findById,
  create,
};